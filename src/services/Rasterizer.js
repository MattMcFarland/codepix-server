/* @flow */


/**
 * Module dependencies.
 */
import {
  fs,
  phantom,
  chalk,
  crypto,
  hljs
} from './modules';

import {
  Service
} from './Service';
type Dimensions = {
  width: number,
  height: number
}
type Data = {
  payload: Object,
  lines: number,
  dimensions: Dimensions,
  filePath: string,
  page: Object,
  code: ?string
};
type ServiceConfig = {
  command: string,
  debug: boolean,
  host: string,
  path: string,
  address: string,
  port: number
};
type File = {
  id: string,
  path:string,
  stats:Object
}
type Meta = {
  shasum: string,
  filename: string,
  code: string,
  size: Object,
  detectedLanguage: string
}

const defaults:ServiceConfig = {
  command: 'phantomjs',
  debug: false,
  host: '127.0.0.1',
  path: '/tmp',
  address: 'http://localhost:3000/api',
  port: 3000
};

/**
 * Private Functions
 */
const toJSON = (data:Object):string => {
  let str = JSON.stringify(data, null, 2);
  JSON.parse(str);
  return str;
};



const toFile = (filePath:string):Promise<File> => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: filePath.split('.')[0].split('/')[1],
          path: filePath,
          stats: stats
        });
      }
    });
  });
};
const createMeta = ({
  code, file
  }):Meta => {
  return {
    shasum: file.id,
    code: code,
    filename: file.id + '.png',
    
    size: file.stats.size,
    detectedLanguage: hljs.highlightAuto(code).language
  };
};

const write = (data:Data):Promise => {
  return new Promise((resolve, reject) => {
    toFile(data.filePath).then(file => {
      fs.writeFile(data.filePath + '.meta.json',
        toJSON(createMeta({code: data.code || '', file})),
        (metaError) => {
          if (metaError) {
            reject(metaError);
          } else {
            resolve(createMeta({code: data.code || '', file}));
          }
        });
    });
  });
};





const hash = (code:string):string => {
  return crypto
    .createHash('sha1')
    .update(code)
    .digest('hex');
};


export class Rasterizer extends Service {
  locals:ServiceConfig;

  logger(...message:any):void {
    if (this.locals.debug) {
      console.log(
        '\n ',
        chalk.cyan('Rasterizer:'),
        chalk.white(...message),
        '\n'
      );
    }
  }

  handleStdOut(data:Object):void {
    this.logger('service:stdout > ', toJSON(data));
  }
  handleStdErr(data:Object):void {
    this.logger('service:stderr > ', toJSON(data));
  }
  handleStdExt(data:Object):void {
    this.logger('service:stderr > ', toJSON(data));
  }
  handleStdReq(data:Object):void {
    this.logger('service:request > ', toJSON(data));
  }

  spawnPhantom():Promise {
    return new Promise((resolve, reject) => {
      phantom.create(service => {
        if (service) {
          this.logger('Process created', service.process.pid);
          service.process.stdout.on('data', this.handleStdOut);
          service.process.stderr.on('data', this.handleStdErr);
          service.process.stderr.on('exit', this.handleStdExt);
          resolve(service);
        } else {
          reject('spawnPhantom failed');
        }
      });
    });
  }

  getPayload(code:string):Object {
    return ({
      operation: 'POST',
      encoding: 'utf8',
      headers: {
        'Content-Type': 'application/json',
        'x-no-compression': 'true',
        accept: 'application/json',
        connection: 'close',
        'accept-encoding': 'gzip, deflate'
      },
      data: toJSON({ code })
    });
  }

  createPage(data:Data):Promise {
    return new Promise((resolve, reject) => {
      this.service.createPage((page, createError) => {
        if (createError) {
          reject(createError);
        } else {
          page.set('viewportSize', data.dimensions);
          this.logger('address', this.locals.address);
          this.logger('payload:\n', toJSON(data.payload));
          data.page = page;
          resolve(data);
        }
      });
    });
  }
  open(data:Data):Promise<Data> {
    return new Promise((resolve, reject)=> {
      data.page.open(this.locals.address, data.payload, (status) => {
        this.logger('open status:', status);
        if (status === 'success') {
          resolve(data);
        } else {
          reject();
        }
      });
    });
  }
  render(data:Data):Promise<Data> {
    return new Promise((resolve, reject) => {
      try {
        data.page.render(data.filePath, () => {
          resolve(data);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  rasterizeCode(code: string):Promise<Object> {
    this.logger('create internal page');
    let lines = code.split(/\r\n|\r|\n/).length;
    let data = {
      code,
      lines,
      page: {},
      payload: this.getPayload(code),
      dimensions: { width: 435, height: lines * 20 },
      filePath: 'data/' + hash(code) + '.png'
    };

    return new Promise((resolve, reject) => {
      this.createPage(data)
        .then(this.open)
        .then(this.render)
        .then(write)
        .then(fileData => {
          resolve({
            ...fileData,
            code: data.code,
            lines: data.lines,
            dimensions: data.dimensions
          });
        }).catch(reject);
    });
  }

  startService():Promise<Rasterizer> {
    this.logger('Starting service...');
    return new Promise((resolve, reject) => {
      this.spawnPhantom().then(service => {
        this.service = service;
        resolve(this);
      }).catch(err => reject(err));
    });
  }

  killService():void {
    if (this.service) {
      // Remove the exit listener to prevent the rasterizer from restarting
      this.service.process.removeListener('exit', this.handleStdExt);
      this.service.process.kill();
      this.logger('Process killed', this.service.process.pid);
    }
  }
  constructor(options:ServiceConfig):void {
    super();

    this.locals = Object.assign({}, defaults, options);

    this.locals.address = 'http://' + options.host +
      ':' + options.port + '/api';

    process.on('exit', () => {
      this.logger('Stopping service...');
      this.killService();
    });

  }

}


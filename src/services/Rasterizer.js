/* @flow */

/**
 * Module dependencies.
 */
import {
  fs,
  phantom,
  chalk,
  crypto
} from './modules';


import {
  Service
} from './Service';

type ServiceConfig = {
  command: string,
  debug: boolean,
  host: string,
  path: string,
  address: string,
  port: number
};
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

type File = {
  id: string,
  path:string,
  stats:Object
}
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

type Meta = {
  id: string,
  card: string,
  site: string,
  creator: string,
  title: string,
  description: string,
  image: string,
  createdAt: string,
  size: string
}

const createMeta = ({
  code, file
  }):Meta => {
  return {
    id: file.id,
    card: 'summary_large_image',
    site: '@codepix',
    creator: '@docodemore',
    title: 'Check out teh code',
    description: code,
    url: 'http://codepix.io/c0dez/' + file.path,
    image: 'c0dez/' + file.path,
    createdAt: file.stats.birthtime,
    size: file.stats.size
  };
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
        accept: 'application/json',
        connection: 'close',
        'accept-encoding': 'gzip, deflate'
      },
      data: toJSON({ code })
    });
  }

  // 6b3c25d7d8918eeda3230357a58ecf5ea20bf5f3
  rasterizeCode(code: string):Promise<File> {
    this.logger('create internal page');
    let payload = this.getPayload(code);
    let lines = code.split(/\r\n|\r|\n/).length;
    let size = { width: 435, height: lines * 20 };
    let filePath = 'data/' + hash(code) + '.png';

    return new Promise((resolve, reject) => {
      this.service.createPage((page, createError) => {
        if (createError) {
          reject(createError);
        } else {
          try {
            page.set('viewportSize', size);
            this.logger('address', this.locals.address);
            this.logger('payload:\n', toJSON(payload));
            page.open(this.locals.address, payload, (status) => {
              this.logger('open status:', status);
              if (status === 'success') {
                page.render(filePath, () => {
                  toFile(filePath).then(file => {
                    this.logger('file created:\n', toJSON(file));
                    fs.writeFile(filePath + '.meta.json',
                      toJSON(createMeta({code, file})),
                      (metaError) => {
                        if (metaError) {
                          reject(metaError);
                        } else {
                          resolve(createMeta({code, file}));
                        }
                      });
                  }).catch(err => reject(err));
                });
              } else {
                this.logger('address', this.locals.address);
                this.logger(toJSON(payload));
                reject(new Error('page open failed'));
              }
            });
          } catch (pageOpenError) {
            reject(pageOpenError);
          }
        }
      });
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


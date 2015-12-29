/* @flow */

/**
* Module dependencies.
*/
import {
  childProcess,
  request
} from './modules';

import {
  Service
} from './Service';


const spawn = childProcess.spawn;

type ServiceConfig = {
  command: string,
  debug: boolean,
  host: string,
  path: string,
  pingDelay: number,
  port: number,
  sleepTime: number
};

const defaults:ServiceConfig = {
  command: 'phantomjs',
  debug: false,
  host: 'http://127.0.0.1',
  path: '/tmp',
  pingDelay: 10000,
  port: 3001,
  sleepTime: 30000
};

export class Rasterizer extends Service {
  isStopping: boolean;
  lastHealthCheckDate: any;
  vars: ServiceConfig;
  service: Object;
  pingServiceIntervalId: number;
  checkHealthIntervalId: number;


  handleExit():void {
    if (this.isStopping) {
      return;
    }
    console.log('phantomjs failed; restarting');
    this.startService();
  }

  handleStdOut(data:Object):void {
    console.log('Rasterizer', data);
  }


  handleStdErr(data:Object):void {
    console.error('Rasterizer', data);
  }

  spawnProcess():void {
    this.service = spawn(this.vars.command, [
      'phantom/codepic.js',
      this.getPath(),
      this.getUrl()
    ]);
  }

  initProcessListeners():void {
    if (this.vars.debug) {
      this.service.stdout.on('data', this.handleStdOut);
    }
    this.service.stderr.on('data', this.handleStdErr);
    this.service.on('exit', this.handleExit);
  }



  startService():Rasterizer {
    this.spawnProcess();
    this.initProcessListeners();
    this.lastHealthCheckDate = Date.now();
    this.pingServiceIntervalId = setInterval(
      this.pingService, this.getPingDelay());
    this.checkHealthIntervalId = setInterval(
      this.checkHealth, 1000);
    if (this.vars.debug) {
      console.log('Phantomjs internal server listening on port ' +
        this.getPort());
    }
    return this;
  }

  killService():void {
    if (this.service) {
      // Remove the exit listener to prevent the rasterizer from restarting
      this.service.removeListener('exit', this.handleExit);
      this.service.kill();
      clearInterval(this.pingServiceIntervalId);
      clearInterval(this.checkHealthIntervalId);
      console.log('Stopping Phantomjs internal server');
    }
  }

  restartService():void {
    if (this.service) {
      this.killService();
      this.startService();
    }
  }

  pingService():Promise {
    return new Promise((resolve, reject) => {
      if (!this.service) {
        this.lastHealthCheckDate = 0;
      }
      request(this.getUrl() + '/healthCheck', (error, response) => {
        console.log(this.getUrl() + '/healthCheck', error, response);
        this.lastHealthCheckDate = Date.now();
        if (error || response.statusCode !== 200) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });

  }

  checkHealth():void {
    if (Date.now() - this.lastHealthCheckDate > this.vars.sleepTime) {
      console.log('Phantomjs process is sleeping. Restarting.');
      this.restartService();
    }
  }

  getPingDelay():number {
    return this.vars.pingDelay;
  }

  getUrl():string {
    return this.vars.host + ':' + this.vars.port;
  }

  getHost():string {
    return this.vars.host;
  }

  getPort():number {
    return this.vars.port;
  }

  getPath():string {
    return this.vars.path;
  }


  constructor(options:ServiceConfig):void {
    super();
    this.vars = Object.assign({}, defaults, options);
    this.isStopping = false;
    this.lastHealthCheckDate = null;
    process.on('exit', () => {
      this.isStopping = true;
      this.killService();
    });

  }
}


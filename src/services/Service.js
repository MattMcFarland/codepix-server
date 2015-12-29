class Base {

  bindAll(...methods) {
    methods.forEach( (method) => this[method] = this[method].bind(this) );
  }

}




export class Service extends Base {
  constructor() {
    super();
    this.bindAll(
      'handleExit',
      'handleStdOut',
      'handleStdErr',
      'spawnProcess',
      'initProcessListeners',
      'startService',
      'killService',
      'restartService',
      'pingService',
      'checkHealth',
      'getPingDelay',
      'getUrl',
      'getHost',
      'getPort',
      'getPath'
    );
  }
}

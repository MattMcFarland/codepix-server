class Base {

  bindAll(...methods) {
    methods.forEach( (method) => this[method] = this[method].bind(this) );
  }

}

export class Service extends Base {
  constructor() {
    super();
    this.bindAll(
      'logger',
      'handleStdOut',
      'handleStdErr',
      'handleStdExt',
      'handleStdReq',
      'spawnPhantom',
      'getPayload',
      'open',
      'render',
      'createPage',
      'rasterizeCode',
      'startService',
      'killService'
    );
  }
}

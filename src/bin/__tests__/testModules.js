import {
  http,
  https,
  debug
} from '../modules';

import { expect } from 'chai';
import { describe, it } from 'mocha';

const assertOK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};

describe('server.js Module Dependencies', () =>{

  it('imports http', () => assertOK(http));

  it('imports https', () => assertOK(https));

  it('imports debug', () => assertOK(debug));

});

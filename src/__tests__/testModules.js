import {
  express,
  path,
  favicon,
  logger,
  cookieParser,
  bodyParser
} from '../modules';

import { expect } from 'chai';
import { describe, it } from 'mocha';

const assertOK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};

describe('Module Dependencies', () =>{

  it('imports express', () => assertOK(express));

  it('imports path', () => assertOK(path));

  it('imports favicon', () => assertOK(favicon));

  it('imports logger', () => assertOK(logger));

  it('imports cookieParser', () => assertOK(cookieParser));

  it('imports bodyParser', () => assertOK(bodyParser));

});

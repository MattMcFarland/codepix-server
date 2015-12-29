/**
 * Module dependencies.
 */
// import { express } from '../modules';
import { Rasterizer } from '../Rasterizer';
import { expect } from 'chai';
import { describe, before, it } from 'mocha';
import request from 'supertest';

const assertOK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});
process.on('SIGTERM', () => {
  process.exit(0);
});
process.on('SIGINT', () => {
  process.exit(0);
});


describe('Rasterizer Spins up', () => {
  let service;
  // let app = express();
  let address = 'http://localhost:3003';
  before((done) => {
    service = new Rasterizer({
      host: 'localhost',
      port: 3003,
      debug: true
    }).startService();
    setTimeout(done, 20);


  });
  it('Rasterizer exists', (done) => {
    assertOK(Rasterizer);
    setTimeout(done, 20);
  });



  describe('Connects with Service', () => {
    it('service exists', (done) => {
      assertOK(service);
      setTimeout(done, 20);
    });

    it('retrieves healthCheck', (done) => {
      request(address)
        .get('/healthCheck')
        .end((err, res) => {
          console.log(err, res);
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });



});

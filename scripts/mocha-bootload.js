require('babel-polyfill');
require('babel-core/register');

var chai = require('chai');

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

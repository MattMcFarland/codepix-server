import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { connect } from '../utils';


const OK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};


describe('Sequelize database connection', () => {

  let db;

  before((done) => {
    connect().then((_db) => {
      db = _db;
      done();
    });
  });

  it('Connection exists.', () => OK(db));
  it('Card model exists.', () => OK(db.Card));
  it('Comment model exists.', () => OK(db.Comment));
  it('Flag model exists.', () => OK(db.Flag));
  it('Tag model exists.', () => OK(db.Tag));
  it('TagItem model exists.', () => OK(db.TagItem));
  it('User model exists.', () => OK(db.User));
  it('Vote model exists.', () => OK(db.Vote));

});

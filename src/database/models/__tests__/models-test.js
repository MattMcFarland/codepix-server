import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { connect } from '../../utils';


const OK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};


describe('Model and instance methods.', () => {

  let Card;
  let card;
  let Comment;
  let comment;
  let Flag;
  let flag;
  let Tag;
  let tag;
  let User;
  let user;
  let Vote;
  let vote;

  before((done) => {
    connect().then((db) => {
      Card = db.Card;
      Comment = db.Comment;
      Flag = db.Flag;
      Tag = db.Tag;
      User = db.User;
      Vote = db.Vote;
      done();
    });
  });

  /* Card */
  {
    it('Card', () => OK(Card));
    it('creates card', (done) => {
      Card.create({title: 'test'}).then(c => {
        card = c;
        done();
      });
    });
    it('card exists.', () => OK(card));
    it('card.getTags()', () => OK(card.getTags));
    it('card.getVotes()', () => OK(card.getVotes));
    it('card.getFlags()', () => OK(card.getFlags));
    it('card.getAuthor()', () => OK(card.getAuthor));
    it('card.getEditor()', () => OK(card.getEditor));
    it('card.addFlag()', () => OK(card.addFlag));
    it('card.addTag()', () => OK(card.addTag));
    it('card.addVote()', () => OK(card.addVote));
    it('card.addComment()', () => OK(card.addComment));
    it('is removed', () => (card.destroy()));
  }
  /* Comment */
  {
    it('Comment', () => OK(Comment));
    it('creates comment', (done) => {
      Comment.create().then(c => {
        comment = c;
        done();
      });
    });
    it('comment exists.', () => OK(comment));
    it('comment.getVotes()', () => OK(comment.getVotes));
    it('comment.getFlags()', () => OK(comment.getFlags));
    it('comment.getAuthor()', () => OK(comment.getAuthor));
    it('comment.getEditor()', () => OK(comment.getEditor));
    it('comment.addFlag()', () => OK(comment.addFlag));
    it('comment.addVote()', () => OK(comment.addVote));
    it('is removed', () => (comment.destroy()));
  }
  /* Flag */
  {
    it('Flag', () => OK(Flag));
    it('creates flag', (done) => {
      Flag.create({title: 'test'}).then(c => {
        flag = c;
        done();
      });
    });
    it('flag exists.', () => OK(flag));
    it('flag.getFlagger()', () => OK(flag.getFlagger));
    it('flag.getComment()', () => OK(flag.getComment));
    it('flag.getCard()', () => OK(flag.getCard));
    it('is removed', () => (flag.destroy()));
  }
  /* Tag */
  {
    it('Tag', () => OK(Tag));
    it('creates tag', (done) => {
      Tag.create({name: 'test'}).then(c => {
        tag = c;
        done();
      });
    });
    it('tag exists.', () => OK(tag));
    it('tag.getCards()', () => OK(tag.getCards));
    it('is removed', () => (tag.destroy()));
  }
  /* User */
  {
    it('User', () => OK(User));
    it('creates user', (done) => {
      User.create({displayName: 'test'}).then(c => {
        user = c;
        done();
      });
    });
    it('user exists.', () => OK(user));
    it('user.getAuthoredCards()', () => OK(user.getAuthoredCards));
    it('user.getEditedCards()', () => OK(user.getEditedCards));
    it('user.getAuthoredComments()', () => OK(user.getAuthoredComments));
    it('user.getEditedComments()', () => OK(user.getEditedComments));
    it('user.getVotes()', () => OK(user.getVotes));
    it('user.addFlags()', () => OK(user.addFlags));
    it('user.createAuthoredCard()', () => OK(user.createAuthoredCard));
    it('user.createAuthoredComment()', () => OK(user.createAuthoredComment));
    it('user.addVote()', () => OK(user.addVote));
    it('user.addFlag()', () => OK(user.addFlag));
    it('is removed', () => (user.destroy()));
  }
  /* Vote */
  {
    it('Vote', () => OK(Vote));
    it('creates vote', (done) => {
      Vote.create().then(c => {
        vote = c;
        done();
      });
    });
    it('vote exists.', () => OK(vote));
    it('vote.getVoter()', () => OK(vote.getVoter));
    it('vote.getCard()', () => OK(vote.getCard));
    it('vote.getComment()', () => OK(vote.getComment));
    it('is removed', () => (vote.destroy()));
  }




});

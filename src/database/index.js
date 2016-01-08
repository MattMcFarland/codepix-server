const models = require('./models');

export const db = models.sequelize;
export const Card = models.Card;
export const Comment = models.Comment;
export const Flag = models.Flag;
export const Tag = models.Tag;
export const User = models.User;
export const Vote = models.Vote;


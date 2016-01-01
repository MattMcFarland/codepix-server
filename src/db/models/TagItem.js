module.exports = function (sequelize, DataTypes) {
  return sequelize.define('item_tag', {
      tag_id: {
        type: DataTypes.INTEGER,
        unique: 'item_tag_taggable'
      },
      taggable: {
        type: DataTypes.STRING,
        unique: 'item_tag_taggable'
      },
      taggable_id: {
        type: DataTypes.INTEGER,
        unique: 'item_tag_taggable',
        references: null
      }
    }
  );
};

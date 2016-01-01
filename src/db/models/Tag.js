
module.exports = function (sequelize, DataTypes) {
  var Tag = sequelize.define('tag', {
      type: {
        type: new DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return 'tagType';
        }
      },
      name: DataTypes.STRING,
      taggable: DataTypes.STRING
    },
    {
      classMethods: {
        associate: (models) => {
          Tag.belongsToMany(models.Card, {
            through: {
              model: models.item_tag,
              unique: false
            },
            foreignKey: 'card_tag_id'
          });
        }
      }
    }
  );
  return Tag;
};

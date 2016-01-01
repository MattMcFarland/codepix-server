module.exports = function (sequelize, DataTypes) {
  var Card = sequelize.define('Card', {
      type: {
        type: new DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return 'cardType';
        }
      },
      shasum: DataTypes.STRING,
      creator: DataTypes.STRING,
      title: DataTypes.STRING,
      url: DataTypes.STRING,
      image: DataTypes.STRING,
      size: DataTypes.INTEGER
    },
    {
      classMethods: {
        associate: (models) => {
          Card.belongsToMany(models.tag, {
            through: {
              model: models.item_tag,
              unique: false
            },
            scope: {
              taggable: 'card'
            },
            foreignKey: 'taggable_id',
            constraints: false
          });
        }
      }
    }
  );
  return Card;
};

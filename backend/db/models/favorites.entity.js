module.exports = (sequelize, DataTypes) => {
  const Favorites = sequelize.define('Favorites', {
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('possibility', 'company'),
      allowNull: true,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id',
    }
  }, {
    id: false,
  });

  Favorites.associate = function (models) {
    Favorites.belongsTo(models.Users, {
      foreignKey: 'userId',
    });
  };

  return Favorites;
};
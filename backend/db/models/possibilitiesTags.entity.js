module.exports = (sequelize, DataTypes) => {
  const PossibilitiesTags = sequelize.define('PossibilitiesTags', {
    possibilityId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Possibilities',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Tags',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  });

  PossibilitiesTags.associate = function (models) {
    PossibilitiesTags.belongsTo(models.Possibilities, {
      foreignKey: 'possibilityId',
      onDelete: 'CASCADE',
    });

    PossibilitiesTags.belongsTo(models.Tags, {
      foreignKey: 'tagId',
      onDelete: 'CASCADE',
    });
  };

  return PossibilitiesTags;
};
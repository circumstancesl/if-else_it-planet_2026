module.exports = (sequelize, DataTypes) => {
  const Tags = sequelize.define('Tags', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM('level', 'employmentType', 'technology'),
        allowNull: false,
        defaultValue: 'technology',
    },
    },
  );

  Tags.associate = function (models) {
    Tags.belongsToMany(models.Possibilities, {
      through: 'PossibilitiesTags',
      foreignKey: 'tagId',
      otherKey: 'possibilityId',
    });
  }

  return Tags;
};

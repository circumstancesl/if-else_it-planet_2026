module.exports = (sequelize, DataTypes) => {
  const Responses = sequelize.define('Responses', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    candidateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    possibilityId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Possibilities',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'reserve'),
      allowNull: true,
      defaultValue: 'pending',
    },
  });

  Responses.associate = function (models) {
    Responses.belongsTo(models.Users, {
      foreignKey: 'candidateId',
      onDelete: 'CASCADE',
    });

    Responses.belongsTo(models.Possibilities, {
      foreignKey: 'possibilityId',
      onDelete: 'CASCADE',
    });
  };

  return Responses;
};
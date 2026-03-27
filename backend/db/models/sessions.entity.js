module.exports = (sequelize, DataTypes) => {
  const Sessions = sequelize.define('Sessions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      expiresIn: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {},
  );

  Sessions.associate = function (models) {
    Sessions.belongsTo(models.Users, {
      foreignKey: 'userId',
    });
  };
  return Sessions;
};

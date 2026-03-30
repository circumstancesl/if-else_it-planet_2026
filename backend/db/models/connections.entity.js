module.exports = (sequelize, DataTypes) => {
  const Connections = sequelize.define('Connections', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: true,
      defaultValue: 'pending',
    },
  });

  Connections.associate = function (models) {
    Connections.belongsTo(models.Users, {
      as: 'Requester',
      foreignKey: 'requesterId',
    });

    Connections.belongsTo(models.Users, {
      as: 'Receiver',
      foreignKey: 'receiverId',
    });
  };

  return Connections;
};
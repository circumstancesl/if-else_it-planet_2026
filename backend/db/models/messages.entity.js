module.exports = (sequelize, DataTypes) => {
  const Messages = sequelize.define('Messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Chats',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Messages.associate = function (models) {
    Messages.belongsTo(models.Chats, {
      foreignKey: 'chatId',
    });

    Messages.belongsTo(models.Users, {
      foreignKey: 'senderId',
    });
  };

  return Messages;
};
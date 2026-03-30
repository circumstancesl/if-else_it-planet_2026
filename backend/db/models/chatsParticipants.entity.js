module.exports = (sequelize, DataTypes) => {
  const ChatsParticipants = sequelize.define('ChatsParticipants', {
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: 'chatId',
      references: {
        model: 'Chats',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: 'userId',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  });

  ChatsParticipants.associate = function (models) {
    ChatsParticipants.belongsTo(models.Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });

    ChatsParticipants.belongsTo(models.Chats, {
      foreignKey: 'chatId',
      onDelete: 'CASCADE',
    });
  };

  return ChatsParticipants;
};
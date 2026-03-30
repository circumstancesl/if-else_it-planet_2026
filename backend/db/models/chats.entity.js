module.exports = (sequelize, DataTypes) => {
  const Chats = sequelize.define('Chats', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
  });

  Chats.associate = function (models) {
    Chats.belongsToMany(models.Users, {
      through: 'ChatsParticipants',
      otherKey: 'userId',
      foreignKey: 'chatId',
    });

    Chats.hasMany(models.Messages, {
      foreignKey: 'chatId',
    });
  };

  return Chats;
};
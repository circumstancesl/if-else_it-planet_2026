module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('candidate', 'curator', 'employer', 'admin'),
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
  );

  Users.associate = function (models) {
    Users.hasOne(models.CandidateProfiles, {
      foreignKey: 'userId',
      sourceKey: 'id',
      onDelete: 'CASCADE',
    });

    Users.hasOne(models.Companies, {
      foreignKey: 'userId',
      sourceKey: 'id',
      onDelete: 'CASCADE',
    });

    Users.hasMany(models.Responses, {
      foreignKey: 'candidateId',
      sourceKey: 'id',
      onDelete: 'CASCADE',
    });

    Users.hasMany(models.Connections, {
      foreignKey: 'requesterId',
      onDelete: 'CASCADE',
    });

    Users.hasMany(models.Connections, {
      foreignKey: 'receiverId',
      onDelete: 'CASCADE',
    });

    Users.hasMany(models.Favorites, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });

    Users.hasMany(models.Sessions, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  }

  return Users;
};

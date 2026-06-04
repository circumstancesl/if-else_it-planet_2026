module.exports = (sequelize, DataTypes) => {
  const CandidateProfiles = sequelize.define('CandidateProfiles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      university: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      graduationYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      about: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resumeURL: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profileVisible: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      applicationsVisible: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
  );

  CandidateProfiles.associate = function (models) {
    CandidateProfiles.belongsTo(models.Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
    CandidateProfiles.belongsToMany(models.Tags, {
      through: 'CandidateProfilesTags',
      foreignKey: 'candidateProfileId',
      otherKey: 'tagId',
    });
  };

  return CandidateProfiles;
};

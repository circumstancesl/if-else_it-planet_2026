module.exports = (sequelize, DataTypes) => {
  const CandidateProfilesTags = sequelize.define('CandidateProfilesTags', {
    candidateProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'CandidateProfiles',
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

  CandidateProfilesTags.associate = function (models) {
    CandidateProfilesTags.belongsTo(models.CandidateProfiles, {
      foreignKey: 'candidateProfileId',
      onDelete: 'CASCADE',
    });

    CandidateProfilesTags.belongsTo(models.Tags, {
      foreignKey: 'tagId',
      onDelete: 'CASCADE',
    });
  };

  return CandidateProfilesTags;
};
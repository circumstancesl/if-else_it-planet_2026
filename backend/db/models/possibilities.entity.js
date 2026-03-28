module.exports = (sequelize, DataTypes) => {
  const Possibilities = sequelize.define('Possibilities', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('internship', 'vacancy', 'mentorship', 'event'),
      allowNull: true,
    },
    format: {
      type: DataTypes.ENUM('office', 'remote', 'hybrid'),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    salary: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: true,
      defaultValue: 'draft',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  Possibilities.associate = function (models) {
    Possibilities.belongsTo(models.Companies, {
      foreignKey: 'companyId',
      onDelete: 'CASCADE',
    });

    Possibilities.belongsToMany(models.Tags, {
      through: 'PossibilitiesTags',
      foreignKey: 'possibilityId',
      otherKey: 'tagId',
    });

    Possibilities.hasMany(models.Responses, {
      foreignKey: 'possibilityId',
      onDelete: 'CASCADE',
    });
  };

  return Possibilities;
};
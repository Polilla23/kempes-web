const { Model, DataTypes, Sequelize } = require('sequelize');

const { SEASON_TABLE } = require('./season.model');
const { COMPETITION_TYPE_TABLE } = require('./competition-type.model');

const COMPETITION_TABLE = 'competitions';

const CompetitionSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  isCompleted: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
  seasonId: {
    field: 'season_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: SEASON_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  competitionTypeId: {
    field: 'competition_type_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: COMPETITION_TYPE_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class Competition extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.Season, { as: 'season' })
    this.belongsTo(models.CompetitionType, { as: 'competitionType' })
    this.hasMany(models.Match, {
      as: 'matches',
      foreignKey: 'competitionId',
    })
    this.belongsToMany(models.Team, {
      as: 'teams',
      through: models.CompetitionTeam,
      foreignKey: 'competitionId',
      otherKey: 'teamId'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COMPETITION_TABLE,
      modelName: 'Competition',
      timestamps: false,
    };
  }
}

module.exports = { COMPETITION_TABLE, Competition, CompetitionSchema };

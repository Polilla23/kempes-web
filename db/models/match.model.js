const { Model, DataTypes, Sequelize } = require('sequelize');

const { TEAM_TABLE } = require('./team.model');
const { COMPETITION_TABLE } = require('./competition.model');
const MATCH_TABLE = 'matches';

const MatchSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  homeTeamGoals: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'home_team_goals',
  },
  awayTeamGoals: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'away_team_goals',
  },
  competitionId: {
    field: 'competition_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: COMPETITION_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  homeTeamId: {
    field: 'home_team_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  awayTeamId: {
    field: 'away_team_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  status: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'pendiente'
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Match extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.Competition, { as: 'competition' });
    this.belongsTo(models.Team, { as: 'homeTeam' });
    this.belongsTo(models.Team, { as: 'awayTeam' });
    this.hasMany(models.Event,
      {
        as: 'events',
        foreignKey: 'matchId',
      })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MATCH_TABLE,
      modelName: 'Match',
      timestamps: false,
    };
  }
}

module.exports = { MATCH_TABLE, Match, MatchSchema };

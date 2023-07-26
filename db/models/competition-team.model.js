const { Model, DataTypes, Sequelize } = require('sequelize');

const { TEAM_TABLE } = require('./team.model');
const { COMPETITION_TABLE } = require('./competition.model');

const COMPETITION_TEAM_TABLE = 'competitions_teams';

const CompetitionTeamSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  competitionId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: COMPETITION_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  teamId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class CompetitionTeam extends Model {
  static associate(models) {
    // define association here
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COMPETITION_TEAM_TABLE,
      modelName: 'CompetitionTeam',
      timestamps: false,
    };
  }
}

module.exports = { COMPETITION_TEAM_TABLE, CompetitionTeam, CompetitionTeamSchema };

const { Model, DataTypes, Sequelize } = require('sequelize');

const { TEAM_TABLE } = require('./team.model');
const PLAYER_TABLE = 'players';

const PlayerSchema = {
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
  lastName: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  birthday: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  position: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  overall: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  salary: {
    allowNull: false,
    type: DataTypes.INTEGER,
    get() {
      const value = this.getDataValue('salary');
      if (value != null) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }
      return null;
    },
  },
  sofifaId: {
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  transfermarktId: {
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  isKempesita: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  currentTeamId: {
    field: 'current_team_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  ownerTeamId: {
    field: 'owner_team_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  payingSalaryTeamId: {
    field: 'paying_salary_team_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Player extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.Team, {
      as: 'currentTeam',
      foreignKey: 'currentTeamId',
    });
    this.belongsTo(models.Team, {
      as: 'ownerTeam',
      foreignKey: 'ownerTeamId',
    });
    this.hasMany(models.Event, {
      as: 'events',
      foreignKey: 'playerId',
    });
    this.hasMany(models.Transfer, {
      as: 'transfers',
      foreignKey: 'playerId',
    });
    this.belongsTo(models.Team, {
      as: 'payingSalaryTeam',
      foreignKey: 'payingSalaryTeamId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PLAYER_TABLE,
      modelName: 'Player',
      timestamps: false,
    };
  }
}

module.exports = { PLAYER_TABLE, Player, PlayerSchema };

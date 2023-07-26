const { Model, DataTypes, Sequelize } = require('sequelize');

const { USER_TABLE } = require('./user.model');
const { BALANCE_TABLE } = require('./balance.model');

const TEAM_TABLE = 'teams';

const TeamSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  image: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
  userId: {
    field: 'user_id',
    allowNull: true,
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: USER_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  balanceId: {
    field: 'balance_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: BALANCE_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  isActive: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};

class Team extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.User, { as: 'user' });
    this.belongsTo(models.Balance, { as: 'balance' });
    this.hasMany(models.Event, {
      as: 'events',
      foreignKey: 'teamId',
    });
    this.hasMany(models.Player, {
      as: 'currentPlayers',
      foreignKey: 'currentTeamId',
    });
    this.hasMany(models.Player, {
      as: 'ownerPlayers',
      foreignKey: 'ownerTeamId',
    });
    this.hasMany(models.Player, {
      as: 'payingSalaryPlayers',
      foreignKey: 'payingSalaryTeamId',
    });
    this.hasMany(models.Match, {
      as: 'homeMatches',
      foreignKey: 'homeTeamId',
    });
    this.hasMany(models.Match, {
      as: 'awayMatches',
      foreignKey: 'awayTeamId',
    });
    this.hasMany(models.Transfer, {
      as: 'sellerTransfers',
      foreignKey: 'sellerTeamId',
    });
    this.hasMany(models.Transfer, {
      as: 'buyerTransfers',
      foreignKey: 'buyerTeamId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: TEAM_TABLE,
      modelName: 'Team',
      timestamps: false,
    };
  }
}

module.exports = { TEAM_TABLE, Team, TeamSchema };

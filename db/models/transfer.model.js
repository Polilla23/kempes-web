const { Model, DataTypes, Sequelize } = require('sequelize');

const { TEAM_TABLE } = require('./team.model');
const { PLAYER_TABLE } = require('./player.model');
const { SEASON_TABLE } = require('./season.model');
const { TRANSFER_TYPE_TABLE } = require('./transfer-type.model');
const { PERIOD_TABLE } = require('./period.model');
const TRANSFER_TABLE = 'transfers';

const TransferSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  transferTypeId: {
    field: 'transfer_type_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TRANSFER_TYPE_TABLE,
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
  amount: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  sellerTeamId: {
    field: 'seller_team_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  buyerTeamId: {
    field: 'buyer_team_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TEAM_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  playerId: {
    field: 'player_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PLAYER_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
  periodId: {
    field: 'period_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PERIOD_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  endLoanSeasonId: {
    field: 'end_loan_season_id',
    allowNull: true,
    type: DataTypes.INTEGER,
    defaultValue: null,
    references: {
      model: SEASON_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  endLoanPeriodId: {
    field: 'end_loan_period_id',
    allowNull: true,
    type: DataTypes.INTEGER,
    defaultValue: null,
    references: {
      model: PERIOD_TABLE,
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
  }
};

class Transfer extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.TransferType, { as: 'transferType'});
    this.belongsTo(models.Team, { as: 'sellerTeam'});
    this.belongsTo(models.Team, { as: 'buyerTeam'});
    this.belongsTo(models.Player, { as: 'player'});
    this.belongsTo(models.Season, { as: 'season'});
    this.belongsTo(models.Season, { as: 'endLoanSeason'});
    this.belongsTo(models.Period, { as: 'period'});
    this.belongsTo(models.Period, { as: 'endLoanPeriod'});
    this.hasMany(models.Installment, {
      as: 'installment',
      foreignKey: 'transferId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: TRANSFER_TABLE,
      modelName: 'Transfer',
      timestamps: false,
    };
  }
}

module.exports = { TRANSFER_TABLE, Transfer, TransferSchema };

const { Model, DataTypes, Sequelize } = require('sequelize');

const { TRANSFER_TABLE } = require('./transfer.model');
const { SEASON_TABLE } = require('./season.model');
const { PERIOD_TABLE } = require('./period.model');
const INSTALLMENT_TABLE = 'installments';

const InstallmentSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  amount: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  status: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'pendiente'
  },
  transferId: {
    field: 'transfer_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TRANSFER_TABLE,
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
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
};

class Installment extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.Transfer, { as: 'transfer' });
    this.belongsTo(models.Season, { as: 'season' });
    this.belongsTo(models.Period, { as: 'period' });
  }

  static config(sequelize) {
    return {
      sequelize,
      modelName: INSTALLMENT_TABLE,
      modelName: 'Installment',
      timestamps: false,
    };
  }
}

module.exports = { INSTALLMENT_TABLE, Installment, InstallmentSchema };

const { Model, DataTypes, Sequelize } = require('sequelize');

const BALANCE_TABLE = 'balances';

const BalanceSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  amount: {
    allowNull: false,
    type: DataTypes.INTEGER,
    get() {
      const value = this.getDataValue('amount');
      if (value != null) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 0})
      }
      return null
    }
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Balance extends Model {
  static associate(models) {
    // define association here
    this.hasOne(models.Team, {
      as: 'team',
      foreignKey: 'balanceId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: BALANCE_TABLE,
      modelName: 'Balance',
      timestamps: false,
    };
  }
}

module.exports = { BALANCE_TABLE, Balance, BalanceSchema };

const { Model, DataTypes, Sequelize } = require('sequelize');

const PERIOD_TABLE = 'periods';

const PeriodSchema = {
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
};

class Period extends Model {
  static associate(models) {
    // define association here
    this.hasMany(models.Season, {
      as: 'seasons',
      foreignKey: 'periodId',
    });
    this.hasMany(models.Transfer, {
      as: 'transfers',
      foreignKey: 'periodId',
    });
    this.hasMany(models.Installment, {
      as: 'installments',
      foreignKey: 'periodId',
    });
    this.hasMany(models.Transfer, {
      as: 'endLoanTransfers',
      foreignKey: 'endLoanPeriodId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PERIOD_TABLE,
      modelName: 'Period',
      timestamps: false,
    };
  }
}

module.exports = { PERIOD_TABLE, Period, PeriodSchema };

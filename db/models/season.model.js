const { Model, DataTypes, Sequelize } = require('sequelize');

const { PERIOD_TABLE } = require('./period.model');

const SEASON_TABLE = 'seasons';

const SeasonSchema = {
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
};

class Season extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.Period, { as: 'period' })
    this.hasMany(models.Competition, {
      as: 'competitions',
      foreignKey: 'seasonId',
    });
    this.hasMany(models.Transfer, {
      as: 'transfers',
      foreignKey: 'seasonId',
    });
    this.hasMany(models.Transfer, {
      as: 'endLoanTransfers',
      foreignKey: 'endLoanSeasonId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: SEASON_TABLE,
      modelName: 'Season',
      timestamps: false,
    };
  }
}

module.exports = { SEASON_TABLE, Season, SeasonSchema };

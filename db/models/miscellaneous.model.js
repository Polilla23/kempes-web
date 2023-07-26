const { Model, DataTypes, Sequelize } = require('sequelize');

const MISCELLANEOUS_TABLE = 'miscellaneous';

const MiscellaneousSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  amount: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  miscellaneousTypeId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: 'miscellaneous_types',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  details: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Miscellaneous extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.MiscellaneousType, {
      as: 'miscellaneousType',
      foreignKey: 'miscellaneousTypeId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MISCELLANEOUS_TABLE,
      modelName: 'Miscellaneous',
      timestamps: false,
    };
  }
}

module.exports = { Miscellaneous, MiscellaneousSchema, MISCELLANEOUS_TABLE };

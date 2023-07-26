const { Model, DataTypes, Sequelize } = require('sequelize');

const MISCELLANEOUS_TYPE_TABLE = 'miscellaneous_types';

const MiscellaneousTypeSchema = {
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

class MiscellaneousType extends Model {
  static associate(models) {
    // define association here
    this.hasMany(models.Miscellaneous, {
      as: 'miscellaneous',
      foreignKey: 'miscellaneousTypeId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MISCELLANEOUS_TYPE_TABLE,
      modelName: 'MiscellaneousType',
      timestamps: false,
    };
  }
}

module.exports = { MiscellaneousType, MiscellaneousTypeSchema, MISCELLANEOUS_TYPE_TABLE };

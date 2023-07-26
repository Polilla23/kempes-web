const { Model, DataTypes, Sequelize } = require('sequelize');

const TRANSFER_TYPE_TABLE = 'transfer_types';

const TransferTypeSchema = {
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

class TransferType extends Model {
  static associate(models) {
    // define association here
    this.hasMany(models.Transfer, {
      as: 'transfers',
      foreignKey: 'transferTypeId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: TRANSFER_TYPE_TABLE,
      modelName: 'TransferType',
      timestamps: false,
    };
  }
}

module.exports = { TRANSFER_TYPE_TABLE, TransferType, TransferTypeSchema };

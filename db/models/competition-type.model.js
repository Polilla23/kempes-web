const { Model, DataTypes, Sequelize } = require('sequelize');

const COMPETITION_TYPE_TABLE = 'competition_types';

const CompetitionTypeSchema = {
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

class CompetitionType extends Model {
  static associate(models) {
    // define association here
    this.hasMany(models.Competition, {
      as: 'competitions',
      foreignKey: 'competitionTypeId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COMPETITION_TYPE_TABLE,
      modelName: 'CompetitionType',
      timestamps: false,
    };
  }
}

module.exports = { COMPETITION_TYPE_TABLE, CompetitionType, CompetitionTypeSchema };

const { Model, DataTypes, Sequelize } = require('sequelize');

const EVENT_TYPE_TABLE = 'event_types';

const EventTypeSchema = {
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

class EventType extends Model {
  static associate(models) {
    // define association here
    this.hasMany(models.Event, {
      as: 'events',
      foreignKey: 'eventTypeId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: EVENT_TYPE_TABLE,
      modelName: 'EventType',
      timestamps: false,
    };
  }
}

module.exports = { EVENT_TYPE_TABLE, EventType, EventTypeSchema };

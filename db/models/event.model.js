const { Model, DataTypes, Sequelize } = require('sequelize');

const { MATCH_TABLE } = require('./match.model');
const { TEAM_TABLE }= require('./team.model');
const { PLAYER_TABLE } = require('./player.model');
const { EVENT_TYPE_TABLE } = require('./event-type.model');
const EVENT_TABLE = 'events';

const EventSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  matchId: {
    field: 'match_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MATCH_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  teamId: {
    field: 'team_id',
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
  eventTypeId: {
    field: 'event_type_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: EVENT_TYPE_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  quantity: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Event extends Model {
  static associate(models) {
    // define association here
    this.belongsTo(models.Team, { as: 'team' })
    this.belongsTo(models.Player, { as: 'player' })
    this.belongsTo(models.EventType, { as: 'eventType' })
    this.belongsTo(models.Match, { as: 'match' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: EVENT_TABLE,
      modelName: 'Event',
      timestamps: false,
    };
  }
}

module.exports = { EVENT_TABLE, Event, EventSchema };

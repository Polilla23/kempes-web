const { User, UserSchema } = require('./user.model');
const { Team, TeamSchema } = require('./team.model');
const { Player, PlayerSchema } = require('./player.model');
const { Balance, BalanceSchema } = require('./balance.model');
const { Season, SeasonSchema } = require('./season.model');
const { Period, PeriodSchema } = require('./period.model');
const { Competition, CompetitionSchema } = require('./competition.model');
const { CompetitionType, CompetitionTypeSchema } = require('./competition-type.model');
const { Match, MatchSchema } = require('./match.model');
const { Event, EventSchema } = require('./event.model');
const { EventType, EventTypeSchema } = require('./event-type.model');
const { CompetitionTeam, CompetitionTeamSchema } = require('./competition-team.model')
const { Transfer, TransferSchema } = require('./transfer.model');
const { TransferType, TransferTypeSchema } = require('./transfer-type.model');
const { Installment, InstallmentSchema } = require('./installment.model');
const { Miscellaneous, MiscellaneousSchema } = require('./miscellaneous.model');
const { MiscellaneousType, MiscellaneousTypeSchema } = require('./miscellaneous-type.model');

function setupModels(sequelize) {
  User.init(UserSchema, User.config(sequelize));
  Balance.init(BalanceSchema, Balance.config(sequelize));
  Period.init(PeriodSchema, Period.config(sequelize));
  EventType.init(EventTypeSchema, EventType.config(sequelize));
  CompetitionType.init(CompetitionTypeSchema, CompetitionType.config(sequelize));
  Team.init(TeamSchema, Team.config(sequelize));
  Season.init(SeasonSchema, Season.config(sequelize));
  Player.init(PlayerSchema, Player.config(sequelize));
  Match.init(MatchSchema, Match.config(sequelize));
  Competition.init(CompetitionSchema, Competition.config(sequelize));
  Event.init(EventSchema, Event.config(sequelize));
  CompetitionTeam.init(CompetitionTeamSchema, CompetitionTeam.config(sequelize));
  Transfer.init(TransferSchema, Transfer.config(sequelize));
  TransferType.init(TransferTypeSchema, TransferType.config(sequelize));
  Installment.init(InstallmentSchema, Installment.config(sequelize));
  Miscellaneous.init(MiscellaneousSchema, Miscellaneous.config(sequelize));
  MiscellaneousType.init(MiscellaneousTypeSchema, MiscellaneousType.config(sequelize));

  User.associate(sequelize.models);
  Balance.associate(sequelize.models);
  Period.associate(sequelize.models);
  EventType.associate(sequelize.models);
  CompetitionType.associate(sequelize.models);
  Team.associate(sequelize.models);
  Season.associate(sequelize.models);
  Player.associate(sequelize.models);
  Match.associate(sequelize.models);
  Competition.associate(sequelize.models);
  Event.associate(sequelize.models);
  Transfer.associate(sequelize.models);
  TransferType.associate(sequelize.models);
  Installment.associate(sequelize.models);
  Miscellaneous.associate(sequelize.models);
  MiscellaneousType.associate(sequelize.models);
}

module.exports = setupModels;

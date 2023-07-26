const express = require('express');

const usersRouter = require('./users.router');
const teamsRouter = require('./teams.router');
const seasonsRouter = require('./seasons.router');
const playersRouter = require('./players.router');
const matchesRouter = require('./matches.router');
const eventsRouter = require('./events.router');
const eventsTypesRouter = require('./events-types.router');
const competitionsRouter = require('./competitions.router');
const competitionsTypesRouter = require('./competitions-types.router');
const balancesRouter = require('./balances.router');
const periodsRouter = require('./periods.router');
const transfersTypesRouter = require('./transfers-types.router');
const transferRouter = require('./transfer.router');
const installmentRouter = require('./installments.router');


function routerApi(app) {
  const router = express.Router();
  app.use('/api', router);
  router.use('/users', usersRouter);
  router.use('/teams', teamsRouter);
  router.use('/seasons', seasonsRouter);
  router.use('/players', playersRouter);
  router.use('/matches', matchesRouter);
  router.use('/events', eventsRouter);
  router.use('/events-types', eventsTypesRouter);
  router.use('/competitions', competitionsRouter);
  router.use('/competitions-types', competitionsTypesRouter);
  router.use('/balances', balancesRouter);
  router.use('/periods', periodsRouter);
  router.use('/transfers-types', transfersTypesRouter);
  router.use('/transfers', transferRouter);
  router.use('/installments', installmentRouter);
}

module.exports = routerApi;

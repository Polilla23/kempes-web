const express = require('express');

const MatchService = require('../services/match.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createMatchSchema, updateMatchSchema, getMatchSchema, queryMatchSchema } = require('../schemas/match.schema');

const router = express.Router();
const service = new MatchService();

router.get('/',
  validatorHandler(queryMatchSchema, 'query'),
  async (req, res, next) => {
    const query = req.query;
    try {
      const matches = await service.find(query);
      res.json(matches);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validatorHandler(getMatchSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const match = await service.findOne(id);
      res.json(match);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createMatchSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newMatch = await service.create(body);
      res.status(201).json(newMatch);
    } catch (err) {
      next(err);
    }
  }
);

// router.post('/',
//   validatorHandler(createMatchSchema, 'body'),
//   async (req, res, next) => {
//     try {
//       const { homeTeamId, awayTeamId, competitionId } = req.body;
//       const matchData = { homeTeamId, awayTeamId, competitionId, homeTeamGoals: null, awayTeamGoals: null};
//       const newMatch = await service.create(matchData);
//       res.status(201).json(newMatch);
//     } catch (err) {
//       next(err);
//     }
//   }
// );

router.patch('/:id',
  validatorHandler(getMatchSchema, 'params'),
  validatorHandler(updateMatchSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedMatch = await service.update(id, body);
      res.json(updatedMatch);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getMatchSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const match = await service.delete(id);
      res.json(match);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

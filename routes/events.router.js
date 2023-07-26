const express = require('express');

const EventService = require('../services/event.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createEventSchema, updateEventSchema, getEventSchema } = require('../schemas/event.schema');

const router = express.Router();
const service = new EventService();

router.get('/', async (req, res, next) => {
  try {
    const events = await service.find();
    res.json(events);
  } catch (err) {
    next(err);
  }
});

router.get('/match/:id',
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const events = await service.findByMatchId(id);
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/player/:id',
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const events = await service.findByPlayerId(id);
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/team/goals/:id',
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const events = await service.findGoalsByTeamId(id);
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/team/:id',
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const events = await service.findByTeamId(id);
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const event = await service.findOne(id);
      res.json(event);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createEventSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newEvent = await service.create(body);
      res.status(201).json(newEvent);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getEventSchema, 'params'),
  validatorHandler(updateEventSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedEvent = await service.update(id, body);
      res.json(updatedEvent);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const event = await service.delete(id);
      res.json(event);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

const express = require('express');

const EventTypeService = require('../services/event-type.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createEventTypeSchema, updateEventTypeSchema, getEventTypeSchema } = require('../schemas/event-type.schema');

const router = express.Router();
const service = new EventTypeService();

router.get('/', async (req, res, next) => {
  try {
    const eventsTypes = await service.find();
    res.json(eventsTypes);
  } catch (err) {
    next(err);
  }
});

router.get('/:id',
  validatorHandler(getEventTypeSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const eventType = await service.findOne(id);
      res.json(eventType);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createEventTypeSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newEventType = await service.create(body);
      res.status(201).json(newEventType);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getEventTypeSchema, 'params'),
  validatorHandler(updateEventTypeSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedEventType = await service.update(id, body);
      res.json(updatedEventType);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getEventTypeSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const eventType = await service.delete(id);
      res.json(eventType);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

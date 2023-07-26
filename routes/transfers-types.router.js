const express = require('express');

const TransferTypeService = require('../services/transfer-type.service');
const validationHandler = require('../middlewares/validator.handler');
const { createTransferTypeSchema, updateTransferTypeSchema, getTransferTypeSchema } = require('../schemas/transfer-type.schema');

const router = express.Router();
const service = new TransferTypeService();

router.get('/',
  async (req, res, next) => {
    try {
      const transferTypes = await service.find();
      res.json(transferTypes);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validationHandler(getTransferTypeSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const transferType = await service.findOne(id);
      res.json(transferType);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validationHandler(createTransferTypeSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newTransferType = await service.create(body);
      res.status(201).json(newTransferType);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validationHandler(getTransferTypeSchema, 'params'),
  validationHandler(updateTransferTypeSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedTransferType = await service.update(id, body);
      res.json(updatedTransferType);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validationHandler(getTransferTypeSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const deletedTransferType = await service.delete(id);
      res.json(deletedTransferType);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

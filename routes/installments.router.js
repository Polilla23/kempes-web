const express = require('express');

const InstallmentService = require('../services/installment.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createInstallmentSchema, updateInstallmentSchema, getInstallmentSchema } = require('../schemas/installment.schema');

const router = express.Router();
const service = new InstallmentService();

router.get('/',
  async (req, res, next) => {
    try {
      const installments = await service.find();
      res.json(installments);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validatorHandler(getInstallmentSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const installment = await service.findOne(id);
      res.json(installment);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createInstallmentSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newInstallment = await service.create(body);
      res.status(201).json(newInstallment);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getInstallmentSchema, 'params'),
  validatorHandler(updateInstallmentSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedInstallment = await service.update(id, body);
      res.json(updatedInstallment);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getInstallmentSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedInstallment = await service.delete(id);
      res.json(deletedInstallment);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

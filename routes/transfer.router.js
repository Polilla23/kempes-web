const express = require('express');

const TransferService = require('../services/transfer.service');
const validationHandler = require('../middlewares/validator.handler');
const { createTransferSchema, updateTransferSchema, getTransferSchema, queryTransferSchema } = require('../schemas/transfer.schema');

const router = express.Router();
const service = new TransferService();

router.get('/',
  validationHandler(queryTransferSchema, 'query'),
  async (req, res, next) => {
    const query = req.query;
    try {
      const transfers = await service.find(query);
      res.json(transfers);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/pending-transfers',
  async (req, res, next) => {
    try {
      const confirmedTransfers = await service.getAllPendingTransfers();
      res.json(confirmedTransfers);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/last-transfers',
  async (req, res, next) => {
    try {
      const lastTransfers = await service.findLastTransfersFirst();
      res.json(lastTransfers);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/buyer-team/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const transfers = await service.findTransferByBuyerTeamId(id);
      res.json(transfers);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/seller-team/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const transfers = await service.findTransferBySellerTeamId(id);
      res.json(transfers);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/current-season/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const transfers = await service.findTransferBySeasonId(id);
      res.json(transfers);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/player/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const transfers = await service.findTransferByPlayerId(id);
      res.json(transfers);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/confirm-transfer/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const confirmedTransfers = await service.confirmTransfer(id);
      res.json(confirmedTransfers);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/finish-loans',
  async (req, res, next) => {
    try {
      const finishedLoans = await service.finishLoan();
      res.json(finishedLoans);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/cancel-transfer/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const canceledTransfers = await service.cancelTransfer(id);
      res.json(canceledTransfers);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const transfer = await service.findOne(id);
      res.json(transfer);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validationHandler(createTransferSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newTransfer = await service.create(body);
      res.status(201).json(newTransfer);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validationHandler(getTransferSchema, 'params'),
  validationHandler(updateTransferSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedTransfer = await service.update(id, body);
      res.json(updatedTransfer);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validationHandler(getTransferSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedTransfer = await service.delete(id);
      res.json(deletedTransfer);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

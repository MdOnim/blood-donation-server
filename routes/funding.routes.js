const express = require('express');
const {
  createPaymentIntent,
  confirmFunding,
  getAllFunding,
  getTotalFunding,
} = require('../controllers/funding.controller');
const { verifyJWT } = require('../middleware/verifyJWT');

const router = express.Router();

router.post('/create-payment-intent', verifyJWT, createPaymentIntent);
router.post('/confirm', verifyJWT, confirmFunding);
router.get('/', verifyJWT, getAllFunding);
router.get('/total', verifyJWT, getTotalFunding);

module.exports = router;

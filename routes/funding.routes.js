const express = require('express');
const {
  createCheckoutSession,
  confirmFunding,
  getAllFunding,
  getTotalFunding,
  getFundingById,
} = require('../controllers/funding.controller');
const { verifyJWT, verifyAdmin } = require('../middleware/verifyJWT');

const router = express.Router();

router.post('/create-checkout-session', verifyJWT, createCheckoutSession);
router.post('/confirm', verifyJWT, confirmFunding);
router.get('/', verifyJWT, getAllFunding);
router.get('/total', verifyJWT, getTotalFunding);
router.get('/:id', verifyJWT, verifyAdmin, getFundingById);

module.exports = router;

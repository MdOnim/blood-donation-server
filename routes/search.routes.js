const express = require('express');
const { searchDonors } = require('../controllers/search.controller');

const router = express.Router();

router.get('/donors', searchDonors);

module.exports = router;

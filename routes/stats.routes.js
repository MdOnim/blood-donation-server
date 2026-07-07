const express = require('express');
const { getDashboardStats } = require('../controllers/search.controller');
const { verifyJWT, verifyAdminOrVolunteer } = require('../middleware/verifyJWT');

const router = express.Router();

router.get('/dashboard', verifyJWT, verifyAdminOrVolunteer, getDashboardStats);

module.exports = router;

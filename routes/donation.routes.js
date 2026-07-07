const express = require('express');
const {
  createDonationRequest,
  getMyDonationRequests,
  getRecentDonationRequests,
  getAllDonationRequests,
  getPendingDonationRequests,
  getDonationRequestById,
  updateDonationRequest,
  updateDonationStatus,
  donateBlood,
  deleteDonationRequest,
} = require('../controllers/donation.controller');
const {
  verifyJWT,
  verifyAdmin,
  verifyAdminOrVolunteer,
} = require('../middleware/verifyJWT');

const router = express.Router();

router.get('/pending', getPendingDonationRequests);
router.get('/my', verifyJWT, getMyDonationRequests);
router.get('/recent', verifyJWT, getRecentDonationRequests);
router.get('/all', verifyJWT, verifyAdminOrVolunteer, getAllDonationRequests);
router.get('/:id', verifyJWT, getDonationRequestById);
router.post('/', verifyJWT, createDonationRequest);
router.put('/:id', verifyJWT, updateDonationRequest);
router.patch('/:id/status', verifyJWT, updateDonationStatus);
router.patch('/:id/donate', verifyJWT, donateBlood);
router.delete('/:id', verifyJWT, deleteDonationRequest);

module.exports = router;

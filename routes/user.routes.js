const express = require('express');
const {
  getProfile,
  updateProfile,
  getAllUsers,
  blockUser,
  unblockUser,
  makeVolunteer,
  removeVolunteer,
  makeAdmin,
  removeAdmin,
} = require('../controllers/user.controller');
const {
  verifyJWT,
  verifyAdmin,
} = require('../middleware/verifyJWT');

const router = express.Router();

router.get('/profile', verifyJWT, getProfile);
router.put('/profile', verifyJWT, updateProfile);
router.get('/all', verifyJWT, verifyAdmin, getAllUsers);
router.patch('/block/:id', verifyJWT, verifyAdmin, blockUser);
router.patch('/unblock/:id', verifyJWT, verifyAdmin, unblockUser);
router.patch('/make-volunteer/:id', verifyJWT, verifyAdmin, makeVolunteer);
router.patch('/remove-volunteer/:id', verifyJWT, verifyAdmin, removeVolunteer);
router.patch('/make-admin/:id', verifyJWT, verifyAdmin, makeAdmin);
router.patch('/remove-admin/:id', verifyJWT, verifyAdmin, removeAdmin);

module.exports = router;

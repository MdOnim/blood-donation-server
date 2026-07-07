const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');

const createDonationRequest = async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (user.status === 'blocked') {
      return res
        .status(403)
        .send({ message: 'Blocked users cannot create donation requests' });
    }

    const donation = await DonationRequest.create({
      ...req.body,
      requesterName: user.name,
      requesterEmail: user.email,
      requesterId: user._id,
      donationStatus: 'pending',
    });

    res.status(201).send(donation);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getMyDonationRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { requesterId: req.decoded.userId };
    if (status) filter.donationStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await DonationRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DonationRequest.countDocuments(filter);

    res.send({
      requests,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getRecentDonationRequests = async (req, res) => {
  try {
    const requests = await DonationRequest.find({
      requesterId: req.decoded.userId,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    res.send(requests);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllDonationRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.donationStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await DonationRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DonationRequest.countDocuments(filter);

    res.send({
      requests,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getPendingDonationRequests = async (req, res) => {
  try {
    const requests = await DonationRequest.find({ donationStatus: 'pending' })
      .sort({ createdAt: -1 });

    res.send(requests);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getDonationRequestById = async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Donation request not found' });
    }
    res.send(request);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateDonationRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Donation request not found' });
    }

    const isOwner = request.requesterId.toString() === req.decoded.userId;
    const isAdmin = req.decoded.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    const updated = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.send(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const { donationStatus } = req.body;
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Donation request not found' });
    }

    const isOwner = request.requesterId.toString() === req.decoded.userId;
    const isAdmin = req.decoded.role === 'admin';
    const isVolunteer = req.decoded.role === 'volunteer';

    if (isVolunteer && !isAdmin) {
      const updated = await DonationRequest.findByIdAndUpdate(
        req.params.id,
        { donationStatus },
        { new: true }
      );
      return res.send(updated);
    }

    if (!isOwner && !isAdmin) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    const updated = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      { donationStatus },
      { new: true }
    );

    res.send(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const donateBlood = async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Donation request not found' });
    }

    if (request.requesterId.toString() === req.decoded.userId) {
      return res
        .status(400)
        .send({ message: 'You cannot donate to your own request' });
    }

    if (request.donationStatus !== 'pending') {
      return res
        .status(400)
        .send({ message: 'This request is no longer available' });
    }

    const user = await User.findById(req.decoded.userId);

    const updated = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      {
        donationStatus: 'inprogress',
        donorName: user.name,
        donorEmail: user.email,
        donorId: user._id,
      },
      { new: true }
    );

    res.send(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteDonationRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Donation request not found' });
    }

    const isOwner = request.requesterId.toString() === req.decoded.userId;
    const isAdmin = req.decoded.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    await DonationRequest.findByIdAndDelete(req.params.id);
    res.send({ message: 'Donation request deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
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
};

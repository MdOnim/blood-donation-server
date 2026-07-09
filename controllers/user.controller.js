const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, bloodGroup, district, upazila } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.decoded.userId,
      { name, avatar, bloodGroup, district, upazila },
      { new: true, runValidators: true }
    ).select('-password');

    res.send(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.send({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    if (req.params.id === req.decoded.userId) {
      return res.status(400).send({ message: 'You cannot block your own account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'blocked' },
      { new: true }
    ).select('-password');
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const makeVolunteer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'volunteer' },
      { new: true }
    ).select('-password');
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const removeVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.role !== 'volunteer') {
      return res.status(400).send({ message: 'User is not a volunteer' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'donor' },
      { new: true }
    ).select('-password');

    res.send(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password');
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const removeAdmin = async (req, res) => {
  try {
    if (req.params.id === req.decoded.userId) {
      return res
        .status(400)
        .send({ message: 'You cannot remove yourself from admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(400).send({ message: 'User is not an admin' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'volunteer' },
      { new: true }
    ).select('-password');

    res.send(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  blockUser,
  unblockUser,
  makeVolunteer,
  removeVolunteer,
  makeAdmin,
  removeAdmin,
};

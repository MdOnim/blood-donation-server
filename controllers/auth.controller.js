const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, avatar, bloodGroup, district, upazila } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      bloodGroup,
      district,
      upazila,
      role: 'donor',
      status: 'active',
    });

    res.status(201).send({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).send({ message: 'Your account has been blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        status: user.status,
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.send({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bloodGroup: user.bloodGroup,
        district: user.district,
        upazila: user.upazila,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { register, login };

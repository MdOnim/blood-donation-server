const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('status role email');

    if (!user) {
      return res.status(401).send({ message: 'Unauthorized access' });
    }

    if (user.status === 'blocked') {
      return res.status(403).send({
        message: 'User account restricted.',
        code: 'ACCOUNT_RESTRICTED',
      });
    }

    req.decoded = {
      ...decoded,
      role: user.role,
      status: user.status,
    };
    next();
  } catch (err) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.decoded.role !== 'admin') {
    return res.status(403).send({ message: 'Forbidden: Admin access required' });
  }
  next();
};

const verifyAdminOrVolunteer = (req, res, next) => {
  if (!['admin', 'volunteer'].includes(req.decoded.role)) {
    return res
      .status(403)
      .send({ message: 'Forbidden: Admin or Volunteer access required' });
  }
  next();
};

module.exports = { verifyJWT, verifyAdmin, verifyAdminOrVolunteer };

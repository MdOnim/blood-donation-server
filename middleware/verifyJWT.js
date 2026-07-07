const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized access' });
    }
    req.decoded = decoded;
    next();
  });
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

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const donationRoutes = require('./routes/donation.routes');
const fundingRoutes = require('./routes/funding.routes');
const searchRoutes = require('./routes/search.routes');
const locationRoutes = require('./routes/location.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  return mongoose.connection;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.get('/', (req, res) => {
  res.send('Blood Donation API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = app;
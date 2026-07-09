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
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Blood Donation API is running');
});

app.use('/api/locations', locationRoutes);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 10000,
      })
      .then((connection) => {
        console.log('Connected to MongoDB');
        return connection;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

app.get('/api/health', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        ok: false,
        error: 'MONGODB_URI is missing in Vercel environment variables',
      });
    }

    await connectDB();
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use(async (req, res, next) => {
  if (req.path === '/') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

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

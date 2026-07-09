const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Funding = require('../models/Funding');
const User = require('../models/User');

const createPaymentIntent = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return res.status(500).send({
        message: 'Stripe is not configured. Add your STRIPE_SECRET_KEY in server/.env',
      });
    }

    const amount = Number(req.body.amount);

    if (!amount || Number.isNaN(amount) || amount < 1) {
      return res.status(400).send({ message: 'Amount must be at least $1' });
    }

    if (amount > 10000) {
      return res.status(400).send({ message: 'Amount cannot exceed $10,000' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: {
        userId: req.decoded.userId,
        purpose: 'lifelink_funding',
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const confirmFunding = async (req, res) => {
  try {
    const { stripePaymentId } = req.body;

    if (!stripePaymentId) {
      return res.status(400).send({ message: 'Payment ID is required' });
    }

    const existing = await Funding.findOne({ stripePaymentId });
    if (existing) {
      return res.status(200).send(existing);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).send({
        message: `Payment not completed. Status: ${paymentIntent.status}`,
      });
    }

    if (paymentIntent.metadata?.userId !== req.decoded.userId) {
      return res.status(403).send({ message: 'Payment does not belong to this user' });
    }

    const amount = paymentIntent.amount / 100;
    const user = await User.findById(req.decoded.userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const funding = await Funding.create({
      userId: user._id,
      userName: user.name,
      amount,
      stripePaymentId,
      fundingDate: new Date(),
    });

    res.status(201).send(funding);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllFunding = async (req, res) => {
  try {
    const fundings = await Funding.find().sort({ fundingDate: -1 });
    res.send(fundings);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getTotalFunding = async (req, res) => {
  try {
    const result = await Funding.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const total = result.length > 0 ? result[0].total : 0;
    res.send({ total });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  confirmFunding,
  getAllFunding,
  getTotalFunding,
};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Funding = require('../models/Funding');
const User = require('../models/User');

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { userId: req.decoded.userId },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const confirmFunding = async (req, res) => {
  try {
    const { amount, stripePaymentId } = req.body;
    const user = await User.findById(req.decoded.userId);

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

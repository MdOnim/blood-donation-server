const Stripe = require('stripe');
const Funding = require('../models/Funding');
const User = require('../models/User');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const isStripeConfigured = () =>
  Boolean(process.env.STRIPE_SECRET_KEY) &&
  !process.env.STRIPE_SECRET_KEY.includes('placeholder');

const validateAmount = (amount) => {
  if (!amount || Number.isNaN(amount) || amount < 1) {
    return 'Amount must be at least $1';
  }
  if (amount > 10000) {
    return 'Amount cannot exceed $10,000';
  }
  return null;
};

const createCheckoutSession = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).send({
        message: 'Stripe is not configured. Add your STRIPE_SECRET_KEY in server/.env',
      });
    }

    const amount = Number(req.body.amount);
    const amountError = validateAmount(amount);
    if (amountError) {
      return res.status(400).send({ message: amountError });
    }

    const user = await User.findById(req.decoded.userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'LifeLink Funding',
              description: 'Support LifeLink blood donation platform',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.decoded.userId,
        purpose: 'lifelink_funding',
      },
      success_url: `${clientUrl}/funding?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/funding?canceled=true`,
    });

    res.send({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const confirmFunding = async (req, res) => {
  try {
    const { stripePaymentId, sessionId } = req.body;

    if (!stripePaymentId && !sessionId) {
      return res.status(400).send({ message: 'Payment ID or session ID is required' });
    }

    let paymentIntentId = stripePaymentId;
    let amount;
    let ownerUserId;

    if (sessionId) {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).send({
          message: `Payment not completed. Status: ${session.payment_status}`,
        });
      }

      if (session.metadata?.userId !== req.decoded.userId) {
        return res.status(403).send({ message: 'Payment does not belong to this user' });
      }

      paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

      if (!paymentIntentId) {
        return res.status(400).send({ message: 'Payment intent not found for this session' });
      }

      amount = session.amount_total / 100;
      ownerUserId = session.metadata.userId;
    } else {
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).send({
          message: `Payment not completed. Status: ${paymentIntent.status}`,
        });
      }

      if (paymentIntent.metadata?.userId !== req.decoded.userId) {
        return res.status(403).send({ message: 'Payment does not belong to this user' });
      }

      paymentIntentId = stripePaymentId;
      amount = paymentIntent.amount / 100;
      ownerUserId = paymentIntent.metadata.userId;
    }

    const existing = await Funding.findOne({ stripePaymentId: paymentIntentId });
    if (existing) {
      return res.status(200).send(existing);
    }

    const user = await User.findById(ownerUserId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const funding = await Funding.create({
      userId: user._id,
      userName: user.name,
      amount,
      stripePaymentId: paymentIntentId,
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

const getFundingById = async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id).populate(
      'userId',
      'name email bloodGroup district upazila avatar'
    );

    if (!funding) {
      return res.status(404).send({ message: 'Funding record not found' });
    }

    let paymentStatus = 'succeeded';

    if (funding.stripePaymentId && isStripeConfigured()) {
      try {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.retrieve(funding.stripePaymentId);
        paymentStatus = paymentIntent.status;
      } catch {
        paymentStatus = 'unavailable';
      }
    }

    res.send({
      _id: funding._id,
      amount: funding.amount,
      fundingDate: funding.fundingDate,
      stripePaymentId: funding.stripePaymentId,
      paymentStatus,
      createdAt: funding.createdAt,
      donor: funding.userId,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  confirmFunding,
  getAllFunding,
  getTotalFunding,
  getFundingById,
};

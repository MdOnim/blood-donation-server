const mongoose = require('mongoose');

const fundingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String, required: true },
    amount: { type: Number, required: true },
    fundingDate: { type: Date, default: Date.now },
    stripePaymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Funding', fundingSchema);

const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientName: { type: String, required: true },
    recipientDistrict: { type: String, required: true },
    recipientUpazila: { type: String, required: true },
    hospitalName: { type: String, required: true },
    fullAddress: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    donationDate: { type: String, required: true },
    donationTime: { type: String, required: true },
    requestMessage: { type: String, required: true },
    donationStatus: {
      type: String,
      enum: ['pending', 'inprogress', 'done', 'canceled'],
      default: 'pending',
    },
    donorName: { type: String, default: '' },
    donorEmail: { type: String, default: '' },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);

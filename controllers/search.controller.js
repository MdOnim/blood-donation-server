const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const Funding = require('../models/Funding');
const districts = require('../data/districts');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, division, district, upazila } = req.query;

    const filter = {
      donationStatus: { $in: ['pending', 'inprogress'] },
    };

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (upazila) filter.recipientUpazila = new RegExp(`^${escapeRegex(upazila)}$`, 'i');

    if (district) {
      filter.recipientDistrict = new RegExp(`^${escapeRegex(district)}$`, 'i');
    } else if (division) {
      const districtNames = districts
        .filter((d) => String(d.division_id) === String(division))
        .map((d) => d.name);

      if (districtNames.length > 0) {
        filter.recipientDistrict = { $in: districtNames };
      }
    }

    const requests = await DonationRequest.find(filter)
      .sort({ createdAt: -1 })
      .select('-donorEmail -requesterEmail');

    res.send(requests);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalRequests = await DonationRequest.countDocuments();

    const fundingResult = await Funding.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalFunding = fundingResult.length > 0 ? fundingResult[0].total : 0;

    res.send({
      totalDonors,
      totalFunding,
      totalRequests,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { searchDonors, getDashboardStats };

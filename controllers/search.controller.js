const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const Funding = require('../models/Funding');
const districts = require('../data/districts');

const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, division, district, upazila } = req.query;

    const filter = {
      role: 'donor',
      status: 'active',
    };

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (upazila) filter.upazila = upazila;

    if (district) {
      filter.district = district;
    } else if (division) {
      const districtNames = districts
        .filter((d) => d.division_id === division)
        .map((d) => d.name);
      filter.district = { $in: districtNames };
    }

    const donors = await User.find(filter).select('-password');
    res.send(donors);
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

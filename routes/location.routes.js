const express = require('express');
const districts = require('../data/districts');
const upazilas = require('../data/upazilas');
const divisions = require('../data/divisions');

const router = express.Router();

router.get('/divisions', (req, res) => {
  res.send(divisions);
});

router.get('/districts', (req, res) => {
  const { division } = req.query;
  if (division) {
    const filtered = districts.filter((d) => String(d.division_id) === String(division));
    return res.send(filtered);
  }
  res.send(districts);
});

router.get('/upazilas/:district', (req, res) => {
  const districtUpazilas = upazilas.filter(
    (u) => u.district === req.params.district
  );
  res.send(districtUpazilas);
});

module.exports = router;

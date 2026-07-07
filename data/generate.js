const fs = require('fs');
const path = require('path');

const districtsRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'districts.json'), 'utf8')
);
const upazilasRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'upazilas.json'), 'utf8')
);

const districtsData = districtsRaw.find((item) => item.type === 'table' && item.name === 'districts').data;
const upazilasData = upazilasRaw.find((item) => item.type === 'table' && item.name === 'upazilas').data;

const districts = districtsData.map((d) => ({
  id: d.id,
  name: d.name,
  division_id: d.division_id,
}));

const districtMap = {};
districtsData.forEach((d) => {
  districtMap[d.id] = d.name;
});

const upazilas = upazilasData.map((u) => ({
  id: u.id,
  name: u.name,
  district: districtMap[u.district_id],
  district_id: u.district_id,
}));

fs.writeFileSync(
  path.join(__dirname, 'districts.js'),
  `module.exports = ${JSON.stringify(districts, null, 2)};`
);

fs.writeFileSync(
  path.join(__dirname, 'upazilas.js'),
  `module.exports = ${JSON.stringify(upazilas, null, 2)};`
);

console.log(`Created ${districts.length} districts and ${upazilas.length} upazilas`);

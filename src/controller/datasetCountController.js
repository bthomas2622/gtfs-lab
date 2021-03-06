import modelHash from '../data/models/modelHash';
import agencyKeyMapper from '../util/agencyKeyMapper.json';

const datasetCountController = async (req, res) => {
  let { agency, agencyKey } = req.query;
  const { dataset } = req.query;
  if (agencyKey == null) {
    agencyKey = agencyKeyMapper[agency.toLowerCase()];
  }
  if (agency == null) {
    agency = 'N/A';
  }
  const MongoModel = modelHash[`${dataset}.txt`].model;
  MongoModel.countDocuments({ agency_key: agencyKey }, (err, count) => {
    if (err) {
      console.error(err);
      res.status(500).send('DB Error');
    } else {
      res.status(200).send({
        agency,
        count,
      });
    }
  });
};

export default datasetCountController;

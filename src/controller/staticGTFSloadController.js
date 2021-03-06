import mongoose from 'mongoose';
import fs from 'fs';
import parseCSV from '../util/parseCSVtoArray';
import modelUpsert from '../util/modelUpsert';
import asyncForEach from '../util/asyncForEach';
import modelHash from '../data/models/modelHash';
import agencyKeyMapper from '../util/agencyKeyMapper.json';

mongoose.Promise = global.Promise;

const loadCSV = (csvToLoad => new Promise((async (resolve, reject) => {
  try {
    const data = await parseCSV(csvToLoad);
    const fileName = csvToLoad.filePath.substring(csvToLoad.filePath.lastIndexOf('/') + 1);

    console.log('parsed filename');
    console.log(fileName);

    const headerArray = data[0];
    const MongoModel = modelHash[fileName].model;
    const input = {};

    // Clear previous entries
    const agencyKey = agencyKeyMapper[csvToLoad.agency.toLowerCase()];
    MongoModel.deleteMany({ agency_key: agencyKey }, ((err) => {
      if (err) {
        console.error(`Delete error on ${csvToLoad.agency}`);
        console.error(err);
      }
    }));

    for (let j = 1; j < data.length; j += 1) {
      for (let i = 0; i < headerArray.length; i += 1) {
        input[headerArray[i]] = data[j][i];
        input.agency_key = agencyKey;
      }
      try {
        await modelUpsert(MongoModel, input, fileName);
      } catch (upsertError) {
        console.error('upsert error caught');
        console.error(upsertError);
      }
    }
    console.log(`done updating ${fileName}`);
    resolve(`done updating ${fileName}`);
  } catch (loadError) {
    console.error('load error caught');
    reject(loadError);
  }
})));

// TODO investigate possible duplicate of last row in csv because of empty last line in csv
const staticGTFSloadController = (req, res) => {
  const { agency } = req.query;
  const agencyFolder = `src/data/gtfsStatic/${agency}`;
  fs.readdir(agencyFolder, async (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('File read error');
    }
    res.status(200).send(`GTFS files for ${agency} processing`);
    console.log(`GTFS files for ${agency} processing`);
    await asyncForEach(files, async (file) => {
      console.log(`${agencyFolder}/${file}`);
      console.log('in loop');
      const csvInfo = { filePath: `${agencyFolder}/${file}`, agency };
      // if (file === 'trips.txt') {
      if (file === 'agency.txt' || file === 'calendar_dates.txt' || file === 'calendar.txt' || file === 'routes.txt' || file === 'stops.txt' || file === 'trips.txt') {
        await loadCSV(csvInfo);
      } else {
        console.log(`skip ${file} data`);
      }
    });
    console.log(`GTFS files for ${agency} loaded`);
    // res.send(`GTFS files for ${agency} loaded`);
  });
};


export default staticGTFSloadController;

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default function handler(req, res) {
  const results = [];
  fs.createReadStream(path.join(process.cwd(), 'app/dashboard/dummy_data.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.status(200).json(results);
    });
}

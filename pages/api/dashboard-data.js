import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default function handler(req, res) {
  const results = [];
  const filePath = path.join(process.cwd(), 'uploads', 'uploaded_data.csv');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'No uploaded file found' });
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.status(200).json(results);
    })
    .on('error', (error) => {
      console.error('Error reading CSV:', error);
      res.status(500).json({ message: 'Error reading CSV file' });
    });
}
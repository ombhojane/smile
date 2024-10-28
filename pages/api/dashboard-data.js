import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'uploads', 'uploaded_data.csv');
    
    try {
      await fs.access(filePath);
    } catch (error) {
      // If uploaded file doesn't exist, use sample data
      const samplePath = path.join(process.cwd(), 'crm_synthetic_data.csv');
      const sampleData = await fs.readFile(samplePath, 'utf-8');
      const parsedData = Papa.parse(sampleData, { header: true }).data;
      return res.status(200).json(parsedData);
    }

    // If we reach here, the uploaded file exists
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsedData = Papa.parse(fileContent, { 
      header: true,
      skipEmptyLines: true 
    }).data;

    if (!parsedData || parsedData.length === 0) {
      throw new Error('No data found in file');
    }

    console.log(`Successfully processed ${parsedData.length} records`);
    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ 
      message: 'Error processing data',
      error: error.message 
    });
  }
}

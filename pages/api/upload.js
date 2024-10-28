import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'uploads');

  try {
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
    });

    // Parse the form
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    if (!files.file || !files.file[0]) {
      throw new Error('No file uploaded');
    }

    const uploadedFile = files.file[0];
    const fileContent = await fs.readFile(uploadedFile.filepath, 'utf-8');
    
    // Validate CSV format
    if (!fileContent.includes(',')) {
      throw new Error('Invalid CSV format');
    }

    // Save to final destination
    const destinationPath = path.join(uploadDir, 'uploaded_data.csv');
    await fs.writeFile(destinationPath, fileContent, 'utf-8');
    
    // Clean up temp file
    await fs.unlink(uploadedFile.filepath);

    console.log('File successfully uploaded and processed');
    res.status(200).json({ 
      message: 'File uploaded successfully',
      size: fileContent.length 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading file',
      error: error.message 
    });
  }
}

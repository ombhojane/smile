'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle } from 'react-icons/fa';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadSuccess(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-100 to-lavender-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <FaCloudUploadAlt className="text-6xl text-lavender-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Upload Your CRM Data</h1>
          <p className="text-gray-600 mt-2">Import your CSV file to analyze customer insights</p>
        </div>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="relative border-2 border-dashed border-lavender-300 rounded-lg p-6 transition-all duration-300 ease-in-out hover:border-lavender-500">
            <input
              type="file"
              id="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <FaFileAlt className="text-4xl text-lavender-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {file ? file.name : 'Drag and drop your CSV file here, or click to select'}
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 ease-in-out ${
              !file || uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-lavender-600 hover:bg-lavender-700 focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-offset-2'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload and Analyze'}
          </button>
        </form>
        {uploadSuccess && (
          <div className="mt-6 text-center text-green-600 flex items-center justify-center">
            <FaCheckCircle className="mr-2" />
            <span>Upload successful! Redirecting to dashboard...</span>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-gray-600">
          Supported file type: CSV. Max file size: 10MB
        </p>
      </div>
    </div>
  );
}

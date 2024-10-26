'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({
    AgeGroup: '',
    Region: '',
    Gender: [],
    PreferredLanguage: '',
    PurchaseCategory: '',
    minAmount: 0,
    maxAmount: 1000000
  });
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    fetch('/api/csv-data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch CSV data');
        }
        return response.text();
      })
      .then(csvString => {
        Papa.parse(csvString, {
          header: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
            }
            setData(results.data);
            generateFilterOptions(results.data);
          },
          error: (error) => {
            setError('Error parsing CSV: ' + error.message);
          }
        });
      })
      .catch(error => {
        setError('Error fetching CSV: ' + error.message);
      });
  }, []);

  const generateFilterOptions = (data) => {
    const options = {
      AgeGroup: [...new Set(data.map(item => item.AgeGroup).filter(Boolean))],
      Region: [...new Set(data.map(item => item.Region).filter(Boolean))],
      Gender: [...new Set(data.map(item => item.Gender).filter(Boolean))],
      PreferredLanguage: [...new Set(data.map(item => item.PreferredLanguage).filter(Boolean))],
      PurchaseCategory: [...new Set(data.map(item => item.PurchaseCategory).filter(Boolean))],
    };
    setFilterOptions(options);
  };

  const updateVisualization = () => {
    const filteredData = data.filter(item => {
      return (
        (filters.AgeGroup === '' || item.AgeGroup === filters.AgeGroup) &&
        (filters.Region === '' || item.Region === filters.Region) &&
        (filters.Gender.length === 0 || filters.Gender.includes(item.Gender)) &&
        (filters.PreferredLanguage === '' || item.PreferredLanguage === filters.PreferredLanguage) &&
        (filters.PurchaseCategory === '' || item.PurchaseCategory === filters.PurchaseCategory) &&
        (parseFloat(item.PurchaseAmount) >= filters.minAmount && parseFloat(item.PurchaseAmount) <= filters.maxAmount)
      );
    });

    return `
      Showing data for ${filteredData.length} contacts:
      Age Group: ${filters.AgeGroup || "All"},
      Region: ${filters.Region || "All"},
      Gender: ${filters.Gender.join(', ') || "All"},
      Preferred Language: ${filters.PreferredLanguage || "All"},
      Purchase Category: ${filters.PurchaseCategory || "All"},
      Purchase Amount: Min: ${filters.minAmount / 100000} Lakh / Max: ${filters.maxAmount / 100000} Lakh
    `;
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        Gender: checked
          ? [...prev.Gender, value]
          : prev.Gender.filter(g => g !== value)
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGeminiRequest = async () => {
    const apiKey = "AIzaSyAIsM6YfAJJmH73AJvkZgkxk8TLuiYY9wg";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
    };

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(selectedPrompt);
      setAiResponse(result.response.text());
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setAiResponse('An error occurred while generating the recommendation.');
    }
  };

  useEffect(() => {
    setRecommendations([
      "Suggest marketing strategies for our top-selling product category.",
      "Identify potential upsell opportunities for customers in the 25-34 age group.",
      "Recommend ways to improve customer engagement in our least active region.",
    ]);
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-lavender-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Remove or replace this Image component if you don't have the smile.png file */}
                {/* <Image src="/smile.png" alt="Smile Logo" width={40} height={40} /> */}
                <span className="ml-2 text-xl font-bold text-gray-800">SMILE CRM</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-1/3 bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Advanced Filters</h3>
            
            <div className="space-y-4">
              {Object.entries(filterOptions).map(([key, options]) => (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  {key === 'Gender' ? (
                    <div className="mt-2 space-y-2">
                      {options.map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            id={option}
                            name={key}
                            type="checkbox"
                            value={option}
                            checked={filters[key].includes(option)}
                            onChange={handleFilterChange}
                            className="h-4 w-4 text-lavender-600 focus:ring-lavender-500 border-gray-300 rounded"
                          />
                          <label htmlFor={option} className="ml-2 block text-sm text-gray-900">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <select
                      id={key}
                      name={key}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lavender-500 focus:border-lavender-500 sm:text-sm rounded-md"
                      value={filters[key]}
                      onChange={handleFilterChange}
                    >
                      <option value="">Select {key.replace(/([A-Z])/g, ' $1').trim()}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              <div>
                <label htmlFor="purchase-amount" className="block text-sm font-medium text-gray-700">Purchase Amount (in Lakh)</label>
                <input
                  type="range"
                  id="purchase-amount-min"
                  name="minAmount"
                  min="0"
                  max="1000000"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  className="mt-1 w-full"
                />
                <input
                  type="range"
                  id="purchase-amount-max"
                  name="maxAmount"
                  min="0"
                  max="1000000"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  className="mt-1 w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Min: {(filters.minAmount / 100000).toFixed(2)} Lakh</span>
                  <span>Max: {(filters.maxAmount / 100000).toFixed(2)} Lakh</span>
                </div>
              </div>
            </div>

            {/* Add this new section for Recommendations */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-2">Recommendations</h4>
              <select
                className="w-full p-2 border rounded"
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
              >
                <option value="">Select a prompt</option>
                {recommendations.map((prompt, index) => (
                  <option key={index} value={prompt}>
                    {prompt}
                  </option>
                ))}
              </select>
              <button
                className="mt-2 bg-lavender-600 text-white px-4 py-2 rounded hover:bg-lavender-700"
                onClick={handleGeminiRequest}
                disabled={!selectedPrompt}
              >
                Get Recommendation
              </button>
            </div>
          </aside>

          <div className="md:w-2/3 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Visualization Area</h2>
            <div className="bg-lavender-100 p-6 rounded-lg min-h-[300px] flex items-center justify-center text-gray-600 mb-4">
              {updateVisualization()}
            </div>
            
            {/* Update this section for AI Response */}
            <div className="bg-white p-6 rounded-lg border border-lavender-200">
              <h3 className="text-xl font-semibold mb-2">AI Recommendation</h3>
              {aiResponse ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-700">Select a prompt and click Get Recommendation to see AI-generated advice here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

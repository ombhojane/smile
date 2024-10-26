'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import * as venn from 'venn.js';
import * as d3 from 'd3';
import { FaSearch } from 'react-icons/fa';
import { CSVLink } from "react-csv";
import { saveAs } from 'file-saver';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  useEffect(() => {
    fetch('/dummy_data.csv')
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
    SegmentID: [...new Set(data.map(item => item.SegmentID).filter(Boolean))],
      AgeGroup: [...new Set(data.map(item => item.AgeGroup).filter(Boolean))],
      Region: [...new Set(data.map(item => item.Region).filter(Boolean))],
      Gender: [...new Set(data.map(item => item.Gender).filter(Boolean))],
      PreferredLanguage: [...new Set(data.map(item => item.PreferredLanguage).filter(Boolean))],
      PurchaseCategory: [...new Set(data.map(item => item.PurchaseCategory).filter(Boolean))],
      Demography: [...new Set(data.map(item => item.Demography).filter(Boolean))],
      FestivalSeason: [...new Set(data.map(item => item.FestivalSeason).filter(Boolean))],
      FestivalBuyingPattern: [...new Set(data.map(item => item.FestivalBuyingPattern).filter(Boolean))],
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

  const generateVennDiagram = (total, filtered) => {
    const sets = [
      { sets: ['Total'], size: total },
      { sets: ['Filtered'], size: filtered },
      { sets: ['Total', 'Filtered'], size: filtered }
    ];

    d3.select("#venn").select("svg").remove();

    const chart = venn.VennDiagram();
    const div = d3.select("#venn").datum(sets).call(chart);

    div.selectAll("text")
      .style("fill", "black")
      .style("font-size", "14px");
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const apiKey = "AIzaSyAIsM6YfAJJmH73AJvkZgkxk8TLuiYY9wg";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on the following CRM data and user query, provide a concise and relevant answer:

Data summary:
${JSON.stringify(data.slice(0, 10))}

User query: ${searchQuery}

Please provide a helpful and informative response.`;

    try {
      const result = await model.generateContent(prompt);
      setSearchResult(result.response.text());
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setSearchResult('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setRecommendations([
      "Suggest marketing strategies for our top-selling product category in North India.",
      "Identify potential upsell opportunities for customers in the 25-34 age group in Tier-2 cities.",
      "Analyze the purchasing behavior of customers during major Indian festivals like Diwali and Holi.",
      "Provide insights on customer preferences based on regional languages and dialects.",
      "Recommend strategies to increase customer retention in metropolitan cities like Mumbai and Delhi.",
      "Analyze the impact of regional cultural events on customer purchasing patterns.",
    ]);
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      updateVisualization();
      generateVennDiagram(data.length, data.filter(item => {
        return (
          (filters.AgeGroup === '' || item.AgeGroup === filters.AgeGroup) &&
          (filters.Region === '' || item.Region === filters.Region) &&
          (filters.Gender.length === 0 || filters.Gender.includes(item.Gender)) &&
          (filters.PreferredLanguage === '' || item.PreferredLanguage === filters.PreferredLanguage) &&
          (filters.PurchaseCategory === '' || item.PurchaseCategory === filters.PurchaseCategory) &&
          (parseFloat(item.PurchaseAmount) >= filters.minAmount && parseFloat(item.PurchaseAmount) <= filters.maxAmount)
        );
      }).length);
    }
  }, [filters, data]);

  const getFilteredData = () => {
    return data.filter(item => {
      return (
        (filters.AgeGroup === '' || item.AgeGroup === filters.AgeGroup) &&
        (filters.Region === '' || item.Region === filters.Region) &&
        (filters.Gender.length === 0 || filters.Gender.includes(item.Gender)) &&
        (filters.PreferredLanguage === '' || item.PreferredLanguage === filters.PreferredLanguage) &&
        (filters.PurchaseCategory === '' || item.PurchaseCategory === filters.PurchaseCategory) &&
        (parseFloat(item.PurchaseAmount) >= filters.minAmount && parseFloat(item.PurchaseAmount) <= filters.maxAmount)
      );
    });
  };

  const handleDownloadJSON = () => {
    const filteredData = getFilteredData();
    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, 'filtered_crm_data.json');
  };

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
              <img src="/crm.png" alt="CRM Logo" style={{ height: '70px' }} />
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

      {/* Enhanced search bar section */}
      <div className="bg-gradient-to-r from-lavender-200 to-lavender-300 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">Explore Your CRM Data</h2>
            <p className="mt-2 text-lg text-gray-600">Ask anything about your customers and get AI-powered insights</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <div className="relative rounded-lg shadow-lg">
                <input
                  type="text"
                  className="form-input block w-full pl-12 pr-12 py-4 text-lg rounded-lg transition ease-in-out duration-150 focus:ring-2 focus:ring-lavender-500 focus:border-lavender-500"
                  placeholder="E.g., 'What's the most popular product category?'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-6 w-6 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-black bg-lavender-600 hover:bg-lavender-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500 transition ease-in-out duration-150"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search result section */}
        {searchResult && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">Search Result</h3>
            <div className="prose max-w-none">
              <ReactMarkdown>{searchResult}</ReactMarkdown>
            </div>
          </div>
        )}

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
                className="mt-2 bg-lavender-600 text-white bg-black px-4 py-2 rounded hover:bg-lavender-700"
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
            
            {/* Data Actions */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="bg-lavender-600 text-white bg-black px-4 py-2 rounded hover:bg-lavender-700 transition duration-300"
              >
                {showDetailedView ? 'Hide Data Viewer' : 'Show Data Viewer'}
              </button>
              <button
                onClick={handleDownloadJSON}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
              >
                Download Filtered Data (JSON)
              </button>
            </div>

            {/* Data Viewer */}
            {showDetailedView && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredData().slice(0, 100).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredData().length > 100 && (
                  <p className="mt-2 text-sm text-gray-500">Showing first 100 rows. Download the full dataset for complete data.</p>
                )}
              </div>
            )}
            
            {/* Venn Diagram Section */}
            <div id="venn" className="mt-6"></div>
            
            {/* AI Response Section */}
            <div className="bg-white p-6 rounded-lg border border-lavender-200 mt-6">
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

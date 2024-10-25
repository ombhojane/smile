'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const filterOptions = {
  ageGroup: ['18-25', '26-35', '36-45', '46-60', '60+'],
  region: ['North', 'South', 'East', 'West'],
  gender: ['Male', 'Female', 'Other'],
  language: ['English', 'Hindi', 'Spanish', 'French'],
  purchaseActivity: ['7days', '30days', '90days'],
};

export default function Dashboard() {
  const [filters, setFilters] = useState({
    ageGroup: '',
    region: '',
    gender: [],
    language: '',
    purchaseActivity: '',
    minAmount: 0,
    maxAmount: 1000000
  });

  const updateVisualization = () => {
    const visualizationText = `
      Showing data for:
      Age Group: ${filters.ageGroup || "All"},
      Region: ${filters.region || "All"},
      Gender: ${filters.gender.join(', ') || "All"},
      Language: ${filters.language || "All"},
      Purchase Activity: ${filters.purchaseActivity || "All"},
      Purchase Amount: Min: ${filters.minAmount / 100000} Lakh / Max: ${filters.maxAmount / 100000} Lakh
    `;
    return visualizationText;
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        gender: checked
          ? [...prev.gender, value]
          : prev.gender.filter(g => g !== value)
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    // This effect can be used to trigger API calls or other side effects when filters change
  }, [filters]);

  return (
    <div className="min-h-screen bg-lavender-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Image src="/smile.png" alt="Smile Logo" width={40} height={40} />
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
                  {key === 'gender' ? (
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
                          {key === 'purchaseActivity' 
                            ? option === '7days' ? 'Last Week' : option === '30days' ? 'Last Month' : 'Last 90 Days'
                            : option}
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
          </aside>

          <div className="md:w-2/3 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Visualization Area</h2>
            <div className="bg-lavender-100 p-6 rounded-lg min-h-[600px] flex items-center justify-center text-gray-600">
              {updateVisualization()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
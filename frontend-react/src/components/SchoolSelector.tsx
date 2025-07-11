/// <reference types="chrome" />

import React, { useEffect, useState } from 'react';

interface SchoolSelectorProps {
  onBack: () => void;
  onSchoolSelect: (school: string, schoolId: number) => void;
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({ 
  onBack, 
  onSchoolSelect, }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<{ name: string; id: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [schools, setSchools] = useState<{ name: string; id: number }[]>([]);

  // only works if the build is loaded as an extension
  useEffect(() => {
    fetch(chrome.runtime.getURL("schools.json"))
      .then(res => res.json())
      .then(data => {
        const parsed = Object.entries(data).map(([name, id]) => ({
          name,
          id: Number(id)
        }));
        setSchools(parsed);
      });
  }, []);
  


  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSchools([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = schools.filter(school =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 100); // Limit to 100 suggestions

    setFilteredSchools(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchTerm, schools]);

  const handleSchoolClick = (school: { name: string; id: number }) => {
    setSearchTerm(school.name);
    setShowSuggestions(false);
    onSchoolSelect(school.name, school.id);
    console.log(school.name, school.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (filteredSchools.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="container" id="school-section">
      <h2>Select School</h2>
      <div>
        <label>Select School: </label>
        <input 
          type="text" 
          id="school-input" 
          placeholder="Start typing..." 
          autoComplete="off"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {showSuggestions && (
          <div
            id="autocomplete-list"
            className={`autocomplete-suggestions${filteredSchools.length > 10 ? ' scrollable' : ''}`}
          >
            {filteredSchools.map((school, index) => (
              <div 
                key={index}
                className="autocomplete-suggestion"
                onClick={() => handleSchoolClick(school)}
              >
                {school.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <button id="back-button" onClick={onBack}>
        Back
      </button>
    </div>
  );
};

export default SchoolSelector; 
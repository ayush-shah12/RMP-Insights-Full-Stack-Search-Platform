import React, { useState } from 'react';

interface ProfessorSearchProps {
  onSubmit: (firstName: string, lastName: string) => void;
  onSchoolSelect: () => void;
  isLoading: boolean;
  selectedSchool: string;
}

const ProfessorSearch: React.FC<ProfessorSearchProps> = ({ 
  onSubmit, 
  onSchoolSelect, 
  isLoading,
  selectedSchool
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(firstName, lastName);
  };

  const handleSwap = () => {
    setFirstName(lastName);
    setLastName(firstName);
  };

  return (
    <div id="main-section" style={{ width: '100%' }}>
      <h1>Find Professor Stats</h1>
      <p>Enter the professor's first and/or last name to retrieve detailed statistics. The system will find the closest match to the entered data, if it exists.</p>
      <p>To search quickly, highlight a professor's name, right-click, and select 'Search this Professor' from the menu.</p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="input-container">
          <div className="input-group">
            <label htmlFor="first-name">First Name</label>
            <input 
              type="text" 
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button 
            type="button" 
            id="swap-button"
            onClick={handleSwap}
            disabled={isLoading}
          >
            <img src="images/swap.png" alt="Swap" className="swap-img" />
          </button>
          <div className="input-group">
            <label htmlFor="last-name">Last Name</label>
            <input 
              type="text" 
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div 
          id="school-link"
          onClick={onSchoolSelect}
          className={selectedSchool ? 'school-selected' : ''}
        >
          {selectedSchool ? `@ ${selectedSchool}` : 'SELECT A SCHOOL'}
        </div>
        
        <div className="space"></div>
        
        <button 
          type="submit" 
          id="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Submit'}
        </button>
      </form>
      
      {isLoading && (
        <div id="loading" className="loading-animation">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--primary-text-color)' }}>
            Searching...
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessorSearch; 
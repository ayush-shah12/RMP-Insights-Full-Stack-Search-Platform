import axios from 'axios';
import qs from 'qs';
import React, { useCallback, useEffect, useState } from 'react';
import { Professor } from '../types/types';
import LoadingOverlay from './components/LoadingOverlay';
import ProfessorResults from './components/ProfessorResults';
import ProfessorSearch from './components/ProfessorSearch';
import SchoolSelector from './components/SchoolSelector';

const Popup: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'school'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [professorData, setProfessorData] = useState<Professor| null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });

  const handleSearchSubmit = useCallback(async (firstName: string, lastName: string, forceRefresh = false) => {
    // check if at least one name is entered
    if (!firstName.trim() && !lastName.trim()) {
      setError('Please enter at least a first name or last name.');
      return;
    }

    if (!selectedSchool || !selectedSchoolId) {
      setError('Please select a school first');
      return;
    }

    setIsLoading(true);
    setIsFullScreenLoading(true);
    setError('');
    setProfessorData(null); // clear old stats

    try {
      const encoded = btoa(`School-${selectedSchoolId}`);

      const data = {
        prof_first_name: firstName,
        prof_last_name: lastName,
        school_code: encoded,
        force_refresh: forceRefresh
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}`,
        qs.stringify(data)
      );

      const res = response.data.data;

      const professorData = {
        firstName: res.firstName,
        lastName: res.lastName,
        department: res.department,
        numRatings: res.numRatings,
        rating: res.avgRating,
        difficulty: res.avgDifficulty,
        takeAgainPercentage: res.wouldTakeAgainPercent === -1 ? -1 : parseFloat(res.wouldTakeAgainPercent),
        tags: res.tags,
        comments: res.userCards,
        lastUpdated: res.lastUpdated
      }

      setProfessorData(professorData);
      saveToCache(professorData); // Save to cache
    } catch (err) {

      // TODO: fix how errors are sent from server
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error : 'Unknown error';
      if (errorMessage.includes('No matching teacher found')){
        setError(`Could not find Professor ${firstName} ${lastName} at ${selectedSchool}.`);
      } else {
        setError('Server Error: Failed to fetch professor data. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsFullScreenLoading(false);
    }
  }, [selectedSchool, selectedSchoolId]);

  const handleRefresh = useCallback(() => {
    if (formData.firstName || formData.lastName) {
      handleSearchSubmit(formData.firstName, formData.lastName, true);
    }
  }, [formData.firstName, formData.lastName, handleSearchSubmit]);

  // load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  // listen for context menu messages
  useEffect(() => {
    const handleMessage = (request: any, sender: any, sendResponse: any) => {
      try {
        if (request.firstName || request.lastName) {
          setFormData({
            firstName: request.firstName || '',
            lastName: request.lastName || ''
          });
          
          // trigger search automatically if we have a school selected
          if (selectedSchool && selectedSchoolId) {
            handleSearchSubmit(request.firstName || '', request.lastName || '');
          }
        }
        if (sendResponse) {
          sendResponse({ success: true });
        }
      } catch (error) {
        console.error('Error handling context menu message:', error);
        if (sendResponse) {
          sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
    };

    // Add message listener with error handling
    try {
      chrome.runtime.onMessage.addListener(handleMessage);
    } catch (error) {
      console.error('Error setting up message listener:', error);
    }

    // Cleanup listener on unmount
    return () => {
      try {
        chrome.runtime.onMessage.removeListener(handleMessage);
      } catch (error) {
        console.error('Error removing message listener:', error);
      }
    };
  }, [selectedSchool, selectedSchoolId, handleSearchSubmit]);

  const loadCachedData = () => {
    // use cached school
    const storedSchool = localStorage.getItem('selectedSchool');
    if (storedSchool) {
      try {
        const schoolData = JSON.parse(storedSchool);
        setSelectedSchool(schoolData[0]);
        setSelectedSchoolId(schoolData[1]);
      } catch (e) {
        console.error('Error parsing stored school data:', e);
      }
    }

    // use cached professor data
    const storedProfInfo = localStorage.getItem('savedProfInfo');
    if (storedProfInfo) {
      try {
        const cachedData = JSON.parse(storedProfInfo);
        
        setFormData({
          firstName: cachedData.firstName,
          lastName: cachedData.lastName
        });

        // convert cached data to Professor type
        const convertedData: Professor = {
          firstName: cachedData.firstName,
          lastName: cachedData.lastName,
          department: cachedData.department,
          numRatings: cachedData.numRatings,
          rating: cachedData.rating,
          difficulty: cachedData.difficulty,
          takeAgainPercentage: cachedData.takeAgainPercentage === -1 ? -1 : parseFloat(cachedData.takeAgainPercentage),
          tags: cachedData.tags,
          comments: cachedData.comments,
          lastUpdated: cachedData.lastUpdated
        };

        setProfessorData(convertedData);
        setError('');
      } catch (e) {
        console.error('Error parsing stored professor data:', e);
      }
    }
  };

  const saveToCache = (data: Professor) => {
    // const cachedData = {
    //   firstName: data.firstName,
    //   lastName: data.lastName,
    //   avgRating: data.rating,
    //   avgDifficulty: data.difficulty,
    //   wouldTakeAgainPercent: data.takeAgainPercentage,
    //   userCards: data.comments || [],
    //   department: data.department,
    //   numRatings: data.numRatings,
    //   tags: data.tags
    // };

    localStorage.setItem('savedProfInfo', JSON.stringify(data));
  };

  const handleFormDataChange = (firstName: string, lastName: string) => {
    setFormData({ firstName, lastName });
  };

  const handleSchoolSelect = () => {
    setCurrentView('school');
  };

  const handleSchoolBack = () => {
    setCurrentView('search');
  };

  const handleSchoolChosen = (school: string, schoolId: number) => {
    setSelectedSchool(school);
    setSelectedSchoolId(schoolId);
    setCurrentView('search');
    
    // Save selected school to localStorage
    localStorage.setItem('selectedSchool', JSON.stringify([school, schoolId]));
  };

  if (currentView === 'school') {
    return (
      <>
        <SchoolSelector
          onBack={handleSchoolBack}
          onSchoolSelect={handleSchoolChosen}
        />
        <LoadingOverlay isVisible={isFullScreenLoading} />
      </>
    );
  }

  // Main view
  return (
    <div className="container">
      <ProfessorSearch
        onSubmit={handleSearchSubmit}
        onSchoolSelect={handleSchoolSelect}
        isLoading={isLoading}
        selectedSchool={selectedSchool}
        formData={formData}
        onFormDataChange={handleFormDataChange}
      />
      {error && (
        <div>
          <p className="error-text" style={{ display: 'block' }}>
            {error}
          </p>
        </div>
      )}
      {professorData && (
        <ProfessorResults
          firstName={professorData.firstName}
          lastName={professorData.lastName}
          department={professorData.department}
          numRatings={professorData.numRatings}
          rating={professorData.rating}
          difficulty={professorData.difficulty}
          takeAgainPercentage={professorData.takeAgainPercentage}
          tags={professorData.tags}
          comments={professorData.comments}
          lastUpdated={professorData.lastUpdated}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      )}
      <LoadingOverlay isVisible={isFullScreenLoading} />
    </div>
  );
};

export default Popup;
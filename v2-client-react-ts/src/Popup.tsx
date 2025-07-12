import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
  }, [selectedSchool]); // Re-run when selectedSchool changes

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
          rating: cachedData.avgRating,
          difficulty: cachedData.avgDifficulty,
          takeAgainPercentage: cachedData.wouldTakeAgainPercent === "N/A" ? -1 : parseFloat(cachedData.wouldTakeAgainPercent),
          tags: cachedData.tags,
          comments: cachedData.userCards.map((card: any) => ({
            course: card.course,
            date: card.date,
            comment: card.comment,
            wta: card.wta
          }))
        };

        setProfessorData(convertedData);
        setError('');
      } catch (e) {
        console.error('Error parsing stored professor data:', e);
      }
    }
  };

  const saveToCache = (data: Professor) => {
    const cachedData = {
      firstName: data.firstName,
      lastName: data.lastName,
      avgRating: data.rating,
      avgDifficulty: data.difficulty,
      wouldTakeAgainPercent: data.takeAgainPercentage === -1 ? "N/A" : data.takeAgainPercentage.toString(),
      userCards: data.comments.map(comment => ({
        course: comment.course,
        date: comment.date,
        comment: comment.comment,
        wta: comment.wta
      })),
      department: data.department,
      numRatings: data.numRatings,
      tags: data.tags
    };

    localStorage.setItem('savedProfInfo', JSON.stringify(cachedData));
  };

  const handleSearchSubmit = async (firstName: string, lastName: string) => {
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
      const encoded = btoa(`school-${selectedSchoolId}`);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}`, {
        firstName,
        lastName,
        schoolId: selectedSchoolId,
        schoolName: selectedSchool,
        encoded: encoded
      });

      const res = response.data;

      const professorData = {
        firstName: res.firstName,
        lastName: res.lastName,
        department: res.department,
        numRatings: res.numRatings,
        rating: res.avgRating,
        difficulty: res.avgDifficulty,
        takeAgainPercentage: res.wouldTakeAgainPercent === "N/A" ? -1 : parseFloat(res.wouldTakeAgainPercent),
        tags: res.tags.map((tag: any) => ({
          tag: tag.tag
        })),
        comments: res.userCards.map((card: any) => ({
          course: card.course,
          date: card.date,
          comment: card.comment,
          wta: card.wta
        }))
      }


      // fake data
      // const professorData: Professor = {
      //   firstName: "Praveen",
      //   lastName: "Tripathi",
      //   department: 'Department of Computer Science',
      //   numRatings: response.status,
      //   rating: 4.2,
      //   difficulty: 3.8,
      //   takeAgainPercentage: 85,
      //   tags: [
      //       {
      //           tag: 'Clear lectures' // potentially add count of tags?
      //       },
      //       {
      //           tag: 'Helpful',
      //       }
      //   ],
      //   comments: [
      //     {
      //       course: 'CS 61A',
      //       date: '2023-12-15',
      //       comment: 'Great professor! Very clear explanations and helpful office hours.',
      //       wta: 'Yes'
      //     },
      //     {
      //       course: 'CS 61B',
      //       date: '2023-11-20',
      //       comment: 'Challenging but fair. Learned a lot in this class.',
      //       wta: 'Yes'
      //     }
      //   ]
      // };

      setProfessorData(professorData);
      saveToCache(professorData); // Save to cache
    } catch (err) {
      setError('Failed to fetch professor data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsFullScreenLoading(false);
    }
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
          comments={professorData.comments.map(comment => ({
            course: comment.course,
            date: comment.date,
            comment: comment.comment,
            wta: comment.wta
          }))}
        />
      )}
      <LoadingOverlay isVisible={isFullScreenLoading} />
    </div>
  );
};

export default Popup; 
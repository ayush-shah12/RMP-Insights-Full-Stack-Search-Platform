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
  const [professorData, setProfessorData] = useState<Professor| null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });

  // load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = () => {
    // use cached school
    const storedSchool = localStorage.getItem('selectedSchool');
    if (storedSchool) {
      try {
        const schoolData = JSON.parse(storedSchool);
        setSelectedSchool(schoolData[0]);
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

    if (!selectedSchool) {
      setError('Please select a school first');
      return;
    }

    setIsLoading(true);
    setIsFullScreenLoading(true);
    setError('');
    setProfessorData(null); // clear old stats

    try {
      // fake call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // fake data
      const mockData: Professor = {
        firstName: "Praveen",
        lastName: "Tripathi",
        department: 'Department of Computer Science',
        numRatings: 5,
        rating: 4.2,
        difficulty: 3.8,
        takeAgainPercentage: 85,
        tags: [
            {
                tag: 'Clear lectures' // potentially add count of tags?
            },
            {
                tag: 'Helpful',
            }
        ],
        comments: [
          {
            course: 'CS 61A',
            date: '2023-12-15',
            comment: 'Great professor! Very clear explanations and helpful office hours.',
            wta: 'Yes'
          },
          {
            course: 'CS 61B',
            date: '2023-11-20',
            comment: 'Challenging but fair. Learned a lot in this class.',
            wta: 'Yes'
          }
        ]
      };

      setProfessorData(mockData);
      saveToCache(mockData); // Save to cache
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
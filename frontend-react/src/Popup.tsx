import React, { useState } from 'react';
import LoadingOverlay from './components/LoadingOverlay';
import ProfessorResults from './components/ProfessorResults';
import ProfessorSearch from './components/ProfessorSearch';
import SchoolSelector from './components/SchoolSelector';

interface ProfessorData {
  name: string;
  department: string;
  courseCount: number;
  rating: number;
  difficulty: number;
  takeAgainPercentage: number;
  tags: string[];
  comments: Array<{
    course: string;
    date: string;
    body: string;
    footer?: string;
  }>;
}

const Popup: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'school'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [professorData, setProfessorData] = useState<ProfessorData | null>(null);
  const [error, setError] = useState<string>('');

  const handleSearchSubmit = async (firstName: string, lastName: string) => {
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
      const mockData: ProfessorData = {
        name: `${firstName} ${lastName}`,
        department: 'Computer Science',
        courseCount: 5,
        rating: 4.2,
        difficulty: 3.8,
        takeAgainPercentage: 85,
        tags: ['Clear lectures', 'Helpful', 'Caring', 'Respected'],
        comments: [
          {
            course: 'CS 61A',
            date: '2023-12-15',
            body: 'Great professor! Very clear explanations and helpful office hours.',
            footer: 'Would take again: Yes'
          },
          {
            course: 'CS 61B',
            date: '2023-11-20',
            body: 'Challenging but fair. Learned a lot in this class.',
            footer: 'Would take again: Yes'
          }
        ]
      };

      setProfessorData(mockData);
    } catch (err) {
      setError('Failed to fetch professor data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsFullScreenLoading(false);
    }
  };

  const handleSchoolSelect = () => {
    setCurrentView('school');
  };

  const handleSchoolBack = () => {
    setCurrentView('search');
  };

  const handleSchoolChosen = (school: string) => {
    setSelectedSchool(school);
    setCurrentView('search');
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
          professorName={professorData.name}
          department={professorData.department}
          courseCount={professorData.courseCount}
          rating={professorData.rating}
          difficulty={professorData.difficulty}
          takeAgainPercentage={professorData.takeAgainPercentage}
          tags={professorData.tags}
          comments={professorData.comments}
        />
      )}
      <LoadingOverlay isVisible={isFullScreenLoading} />
    </div>
  );
};

export default Popup; 
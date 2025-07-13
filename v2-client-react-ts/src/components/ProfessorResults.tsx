import React, { useEffect, useRef } from 'react';
import CommentsSection from './CommentsSection';
import TagsSection from './TagsSection';

import { ProfessorResultsProps } from '../../types/types';

const ProfessorResults: React.FC<ProfessorResultsProps> = ({
    firstName,
    lastName,
    department,
    numRatings,
    rating,
    difficulty,
    takeAgainPercentage,
    tags,
    comments,
    lastUpdated,
    onRefresh,
    isLoading
}) => {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      const circle = circleRef.current;
      // Remove old points
      while (circle.firstChild) circle.removeChild(circle.firstChild);
      
      const dots = 80;
      const marked = takeAgainPercentage === -1 ? -1 : takeAgainPercentage;
      const percent = Math.floor(dots * marked / 100);
      const rotate = 360 / dots;
      let points = "";
      
      // Create all 80 points
      for (let i = 0; i < dots; i++) {
        points += `<div class="points" style="--i: ${i}; --rot: ${rotate}deg"></div>`;
      }
      
      circle.innerHTML = points;
      
      // Mark the appropriate number of points
      const pointsMarked = circle.querySelectorAll('.points');
      for (let i = 0; i < percent; i++) {
        pointsMarked[i].classList.add('marked');
      }
    }
  }, [takeAgainPercentage]);

  const formatLastUpdated = (lastUpdated: string) => {
    
    const date = new Date(lastUpdated);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return `${diffDays}d ago`;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 id="professor-stats" style={{ margin: '0' }}>{firstName + ' ' + lastName}</h4>
          <h5 id="professor-stats-dep" style={{ margin: '0' }}>{department}</h5>
        </div>
        <div className="last-updated-container" style={{ flexDirection: 'column', alignItems: 'flex-end', border: 'none', padding: '0', minWidth: 'fit-content' }}>
          <span style={{ marginBottom: '4px' }}>Last Updated: {formatLastUpdated(lastUpdated)}</span>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>
      <h6 id="professor-stats-num" style={{ marginTop: '5px', marginBottom: '0' }}>{numRatings} ratings</h6>
      <div className="box-container">
        <div className="box">
          <div className="avg-rating">
            <h2 id="avg-rating-num">
              <span id="rating-value">{rating ? rating.toFixed(1) : "N/A"}</span>
              <sup>/5</sup>
            </h2>
            <p>Rating</p>
          </div>
          <div className="avg-difficulty">
            <h2 id="avg-difficulty-num">
              <span id="difficulty-value">{difficulty ? difficulty.toFixed(1) : "N/A"}</span>
              <sup>/5</sup>
            </h2>
            <p>Difficulty</p>
          </div>
        </div>
        <div className="box">
          <div className="boxbar">
            <div ref={circleRef} className="circle" style={{ '--bgColor': '#ff0070' } as React.CSSProperties}></div>
            <div className="text">
              <h2 id="circle-num">
                <span id="take-again-value">
                  {takeAgainPercentage === -1 ? "N/A" : Math.round(takeAgainPercentage)}
                </span>
                {takeAgainPercentage !== -1 && <sup>%</sup>}
              </h2>
              <small>Would Take Again</small>
            </div>
          </div>
        </div>
      </div>
      <TagsSection tags={tags || []} />
      <CommentsSection comments={comments || []} />
    </>
  );
};

export default ProfessorResults; 
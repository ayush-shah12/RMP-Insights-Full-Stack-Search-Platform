import React, { useEffect, useRef } from 'react';
import CommentsSection from './CommentsSection';
import TagsSection from './TagsSection';

import { Professor } from '../../types/types';

const ProfessorResults: React.FC<Professor> = ({
    firstName,
    lastName,
    department,
    numRatings,
    rating,
    difficulty,
    takeAgainPercentage,
    tags,
    comments
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

  return (
    <>
      <h4 id="professor-stats">{firstName + ' ' + lastName}</h4>
      <h5 id="professor-stats-dep">{department}</h5>
      <h6 id="professor-stats-num">{numRatings} ratings</h6>
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
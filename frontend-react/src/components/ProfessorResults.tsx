import React, { useEffect, useRef } from 'react';
import CommentsSection from './CommentsSection';
import TagsSection from './TagsSection';

interface Comment {
  course: string;
  date: string;
  body: string;
  footer?: string;
}

interface ProfessorResultsProps {
  professorName: string;
  department: string;
  courseCount: number;
  rating: number;
  difficulty: number;
  takeAgainPercentage: number;
  tags: string[];
  comments: Comment[];
}

const ProfessorResults: React.FC<ProfessorResultsProps> = ({
  professorName,
  department,
  courseCount,
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
      <h4 id="professor-stats">{professorName}</h4>
      <h5 id="professor-stats-dep">{department}</h5>
      <h6 id="professor-stats-num">{courseCount} courses</h6>
      <div className="box-container">
        <div className="box">
          <div className="avg-rating">
            <h2 id="avg-rating-num">
              <span id="rating-value">{rating.toFixed(1)}</span>
              <sup>/5</sup>
            </h2>
            <p>Rating</p>
          </div>
          <div className="avg-difficulty">
            <h2 id="avg-difficulty-num">
              <span id="difficulty-value">{difficulty.toFixed(1)}</span>
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
      <TagsSection tags={tags} />
      <CommentsSection comments={comments} />
    </>
  );
};

export default ProfessorResults; 
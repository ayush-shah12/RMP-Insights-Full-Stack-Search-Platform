import React from 'react';
import { Comment } from '../../types/types';

interface CommentsSectionProps {
  comments: Comment[];
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments }) => {
    
  const formatDate = (og_date?: string) => {
    if (!og_date) return "N/A";
    
    try{
      const date = new Date(og_date);
      const formattedDate = date.toISOString().split("T")[0];

      return formattedDate;
    }
    catch{
      return og_date;
    }
  };


  if (!comments || comments.length === 0) {
    return (

      <div id="comments-section">
        <h3>Student Comments</h3>
        <div id="comments">
          <div className="comment">
            <span className="comment-body">No comments available</span>
          </div>
        </div>
      </div>
    )
  }
  else {

    return (
      <div id="comments-section">
        <h3>Student Comments</h3>
        <div id="comments">
          {comments.slice(0, 10).map((comment, index) => (
            <div key={index} className="comment">
              <div className="comment-header">
                <span className="course">{comment.course || "N/A"}</span>
                <span className="date">{formatDate(comment.date)}</span>
              </div>
              <div className="comment-body">{comment.comment || "N/A"}</div>
              {comment.wta && <div className="comment-footer">Would take again: {comment.wta || "N/A"}</div>}
            </div>
          ))}
        </div>
        <p className="comment-note">
          *The number of comments shown is restricted to a maximum of 10, only the most recent are shown.*
        </p>
      </div>
    );
  };
};

export default CommentsSection; 
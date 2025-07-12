import React from 'react';
import { Comment } from '../../types/types';

interface CommentsSectionProps {
  comments: Comment[];
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments }) => {
  if (!comments || comments.length === 0) return null;
  return (
    <div id="comments-section">
      <h3>Student Comments</h3>
      <div id="comments">
        {comments.slice(0, 10).map((comment, index) => (
          <div key={index} className="comment">
            <div className="comment-header">
              <span className="course">{comment.course || "N/A"}</span>
              <span className="date">{comment.date || "N/A"}</span>
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

export default CommentsSection; 
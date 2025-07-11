import React from 'react';

interface Comment {
  course: string;
  date: string;
  body: string;
  footer?: string;
}

interface CommentsSectionProps {
  comments: Comment[];
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments }) => {
  if (!comments || comments.length === 0) return null;
  return (
    <div id="comments-section">
      <h3>Student Comments</h3>
      <div id="comments">
        {comments.map((comment, index) => (
          <div key={index} className="comment">
            <div className="comment-header">
              <span className="course">{comment.course}</span>
              <span className="date">{comment.date}</span>
            </div>
            <div className="comment-body">{comment.body}</div>
            {comment.footer && <div className="comment-footer">{comment.footer}</div>}
          </div>
        ))}
      </div>
      <p className="comment-note">
        *The number of comments shown is restricted to a maximum of 6, only the most recent are shown.*
      </p>
    </div>
  );
};

export default CommentsSection; 
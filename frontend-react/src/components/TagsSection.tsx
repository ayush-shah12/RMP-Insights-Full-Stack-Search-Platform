import React from 'react';

interface TagsSectionProps {
  tags: string[];
}

const TagsSection: React.FC<TagsSectionProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div id="tags-section">
      <h3 className="tagh3">Top Tags</h3>
      <div id="tags" className="tag-container">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsSection; 
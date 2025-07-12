import React from 'react';
import { Tag } from '../../types/types';

interface TagsSectionProps {
  tags: Tag[];
}

const TagsSection: React.FC<TagsSectionProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return (
      <div id="tags-section">
      <h3 className="tagh3">Top Tags</h3>
        <div id="tags" className="tag-container">
          <span className="tag">No tags available</span>
      </div>
    </div>

    )
  }
  else {

    return (
      <div id="tags-section">
        <h3 className="tagh3">Top Tags</h3>
        <div id="tags" className="tag-container">
          {tags.slice(0, 6).map((tag, index) => (
            <span key={index} className="tag">
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    );
  };
}
export default TagsSection; 
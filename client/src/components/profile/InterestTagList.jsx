import React from 'react';
import '../../styles/InterestTagList.css';

const InterestTagList = ({ interests, selectedInterests, onToggleInterest }) => {
  return (
    <div className="interest-tag-list">
      {interests.map(interest => (
        <div 
          key={interest}
          className={`interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
          onClick={() => onToggleInterest(interest)}
        >
          {interest}
        </div>
      ))}
    </div>
  );
};

export default InterestTagList;
import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <span id="loading-screen-on-off">
      <div id="loading-screen">
      </div>
    </span>
  );
};

export default LoadingOverlay; 
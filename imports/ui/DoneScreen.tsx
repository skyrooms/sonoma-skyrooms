import React from 'react';

const DoneScreen: React.FC = () => {
  return (
    <div className="anomaly-modal-overlay">
      <div className="anomaly-modal-content">
        <h1 className="anomaly-text">
          <span style={{ animation: 'glitch 0.5s infinite' }}>DONE</span>
        </h1>
      </div>
    </div>
  );
};

export default DoneScreen;
// client/LoadingScreen.tsx

import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); // Blinking cursor speed

    return () => {
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="loading-screen-container">
      <p className="loading-text text-glow">
        DOWNLOADING...
        <span className="cursor">{showCursor ? '█' : ' '}</span>
      </p>
    </div>
  );
};

export default LoadingScreen;
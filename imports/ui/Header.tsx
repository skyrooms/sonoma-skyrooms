import React from 'react';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <div className="header-container">
      <button className="neon-button text-glow" onClick={onBack}>
        &lt; BACK
      </button>
      <h1 className="header-title text-glow">SONOMA SKYROOMS</h1>
    </div>
  );
};

export default Header;
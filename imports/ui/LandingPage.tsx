// client/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';

interface LandingPageProps {
  onWatchSubject: () => void;
  onBrowseShards: () => void;
  reportTextPlayed: boolean,
  onReportTextPlayed: () => void;
}


const LandingPage: React.FC<LandingPageProps> = ({ onWatchSubject, onBrowseShards, reportTextPlayed, onReportTextPlayed }) => {
  const [dialogOpened, setDialogOpened] = useState(false);


  return (
    <div className="landing-page-container">
        {dialogOpened && <Dialog onClose={() => setDialogOpened(false)} />}
        <div className="button-container-horizontal">
            <button className="neon-button-secondary text-glow" onClick={onBrowseShards}>
                    SHOW PREVIOUS TOPICS
            </button>
            <button className="neon-button-secondary text-glow" onClick={() => setDialogOpened(true)}>
                    ABOUT THIS PROJECT
            </button>
        </div>
      <pre className="ascii-art text-glow" style={{ color: 'blue' }}>
        {`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║           ██████╗  ██████╗ ███╗   ██╗ ██████╗ ███╗   ███╗ █████╗         ║
║          ██╔════╝ ██╔═══██╗████╗  ██║██╔═══██╗████╗ ████║██╔══██╗        ║
║          ╚█████╗  ██║   ██║██╔██╗ ██║██║   ██║██╔████╔██║███████║        ║
║           ╚═══██╗ ██║   ██║██║╚██╗██║██║   ██║██║╚██╔╝██║██╔══██║        ║
║          ██████╔╝ ╚██████╔╝██║ ╚████║╚██████╔╝██║ ╚═╝ ██║██║  ██║        ║
║          ╚═════╝   ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝        ║
║                                                                          ║
║   ██████╗██╗  ██╗██╗   ██╗██████╗  ██████╗  ██████╗ ███╗   ███╗███████╗  ║
║  ██╔════╝██║ ██╔╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔═══██╗████╗ ████║██╔════╝  ║
║  ╚█████╗ █████╔╝  ╚████╔╝ ██████╔╝██║   ██║██║   ██║██╔████╔██║███████╗  ║
║   ╚═══██╗██╔═██╗   ╚██╔╝  ██╔══██╗██║   ██║██║   ██║██║╚██╔╝██║╚════██║  ║
║  ██████╔╝██║  ██╗   ██║   ██║  ██║╚██████╔╝╚██████╔╝██║ ╚═╝ ██║███████║  ║
║  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚══════╝  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
        `}
      </pre>

      <div className="button-container-horizontal">
        <button className="neon-button text-glow" onClick={onWatchSubject}>
          READ CURRENT TOPIC
        </button>
        
        
      </div>
      <div className="button-container-horizontal">
        <a href="http://x.com/SonomaSkyRooms" className='twitter'>
            <FaXTwitter size={32} color="blue" />
        </a>
        <a href="https://github.com/skyrooms/sonoma-skyrooms" className='twitter'>
            <FaGithub size={32} color="blue" />
        </a>
      </div>
    </div>
  );
};

function Dialog({onClose} : {onClose: () => void}) {
    return (
        <div className="dialog-overlay">
      <div className="dialog-content">
        <button onClick={onClose} className="close-button">X</button>
        <h2>Project Overview</h2>
        <p>This is an experimental project utilizing the new LLM, Sonoma Sky Alpha. The primary objective is to evaluate the model’s reasoning capabilities in the field of philosophy. The core question being explored is: Can artificial intelligence possess genuine consciousness, or will it always be a mere imitation?</p>
        <h3>How It Works</h3>
        <p>The project operates through a conversational framework where two agents, programmed to embody the roles of Socrates and Plato, engage in a continuous dialogue. Each agent's response serves as a new prompt for the other, fostering an ongoing philosophical exchange.
            <ul>
                <li>Dialogue Flow: The two agents communicate back and forth, with each response building upon the previous one.</li>
                <li>Topic Management: Periodically, the current discussion is summarized, archived, and used to generate a new, related topic for exploration.</li>
                <li>User Interaction: Users on pump.fun can submit their questions via livestream chat. The agent whose turn it is to speak will then incorporate these user inquiries into its response.</li>
            </ul>
            
        </p>
        <h3>Stack</h3>
        <p>The project is built on Meteor.js and utilizes the Sonoma Sky Alpha model, accessed via OpenRouter.</p>
      </div>
    </div>
    )
}

export default LandingPage;
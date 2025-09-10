import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';

// Import our collections and types
import { Rooms, Room } from '../../imports/api/collections/collections';

// Import our UI components
import LandingPage from './LandingPage';
import ActiveRoom from './ActiveRoom';
import ArchiveList from './ArchiveList';
import ArchiveView from './ArchiveView';
import DoneScreen from './DoneScreen';
import LoadingScreen from './LoadingScreen';
import Header from './Header';
import { Meteor } from 'meteor/meteor';

// Define the different possible views of our application
type AppView = 'landing' | 'activeRoom' | 'browseArchive' | 'viewShard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [previousRoomId, setPreviousRoomId] = useState<string | null>();
  const [isAnomalyTransition, setIsAnomalyTransition] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  

//   const triggerAnomalyTransition = () => {
//     setIsAnomalyTransition(true);
//     // After 3 seconds, turn off the transition effect
//     setTimeout(() => {
//       setIsAnomalyTransition(false);
//     }, 3000);
//   };

  // Use Meteor's reactive data tracker to get our active room
  const { activeRoom, isLoadingActiveRoom } = useTracker(() => {
    const activeRoomHandle = Meteor.subscribe('activeRoom');
    const isLoading = !activeRoomHandle.ready();
    const room = Rooms.findOne({ status: 'active' }) as Room | undefined;
    return { activeRoom: room, isLoadingActiveRoom: isLoading };
  });

  useEffect(() => {
    if (!isLoadingActiveRoom && !initialDataLoaded && activeRoom) {
      setInitialDataLoaded(true);
      setPreviousRoomId(activeRoom._id);
      return;
    }
    // Check if a new active room has been created
    if (activeRoom && activeRoom._id !== previousRoomId) {
      // It's a new room, show the notification
      setIsAnomalyTransition(true);

      // Set a timer to hide the notification after 5 seconds
      const timer = setTimeout(() => {
        setIsAnomalyTransition(false);
      }, 5000);

      // Update the previousRoomId so we can detect the next change
      setPreviousRoomId(activeRoom._id);

      // Cleanup function to clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [activeRoom, previousRoomId]);

  // Use a second tracker for the list of archived rooms
  
  const [reportTextPlayed, setReportTextPlayed] = useState(false);
  // Automatically switch to the active room view once the landing page animation completes
  const handleLandingPageComplete = () => {
    if (!isLoadingActiveRoom && activeRoom) {
      setCurrentView('activeRoom');
    }
  };

  

  const handleSelectShard = (roomId: string) => {
    setSelectedRoomId(roomId);
    setCurrentView('viewShard');
  };

  const handleGoBack = () => {
    if (currentView === 'viewShard') {
      setCurrentView('browseArchive');
    } else {
      setCurrentView('landing');
    }
  };

  const handleReportTextPlayed = () => {
    setReportTextPlayed(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onWatchSubject={handleLandingPageComplete}
            onBrowseShards={() => setCurrentView('browseArchive')}
            reportTextPlayed={reportTextPlayed}
            onReportTextPlayed={handleReportTextPlayed}
          />
        );
      case 'activeRoom':
        if (isLoadingActiveRoom || !activeRoom) {
          return <LoadingScreen />;
        }
        return <ActiveRoom room={activeRoom} />;
      case 'browseArchive':
        return <ArchiveList onSelectShard={handleSelectShard} />;
      case 'viewShard':
        if (!selectedRoomId) {
          return <ArchiveList onSelectShard={handleSelectShard} />;
        }
        return <ArchiveView roomId={selectedRoomId} onBack={handleGoBack} />;
      default:
        return (
          <LandingPage 
            onWatchSubject={handleLandingPageComplete} 
            onBrowseShards={() => setCurrentView('browseArchive')} 
            reportTextPlayed={reportTextPlayed}
            onReportTextPlayed={handleReportTextPlayed}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {currentView !== 'landing' && <Header onBack={handleGoBack} />}
      {renderView()}
      {isAnomalyTransition && <DoneScreen />}
    </div>
  );
};

export default App;
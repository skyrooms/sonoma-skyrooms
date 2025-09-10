import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Messages, Message } from '../../imports/api/collections/collections';
import { Meteor } from 'meteor/meteor';
import { PumpMessages } from './ActiveRoom';

interface ArchiveViewProps {
  roomId: string;
  onBack: () => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ roomId, onBack }) => {
  const { messages, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('realityShard', roomId);
    const messages = Messages.find({ roomId }, { sort: { timestamp: 1 } }).fetch() as Message[];
    return { messages, isLoading: !handle.ready() };
  });

  if (isLoading) {
    return <p className="text-glow">Loading shard transcript...</p>;
  }

  return (
    <div className="archive-view-container">
      <div className="message-transcript-list">
        {messages.map((message) => (
          <div key={message._id} className="transcript-message-item text-glow">
            <p className='live-message-text'>
              <strong className="message-sender-prefix">{`> ${message.senderId.toUpperCase() == 'NARRATOR' ? 'SOCRATES' : 'PLATO'}:`}</strong>
              {' '}
              <span className="transcript-message-content">{message.content}</span>
            </p>
            <PumpMessages message={message} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchiveView;
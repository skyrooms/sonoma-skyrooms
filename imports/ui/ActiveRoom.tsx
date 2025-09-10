// client/ActiveRoom.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Messages, Message, Room } from '../../imports/api/collections/collections';
import { Meteor } from 'meteor/meteor';
import LoadingScreen from './LoadingScreen';

// This is a sub-component to handle the typing animation for a single message
const MessageWithTyping: React.FC<{ message: Message }> = ({ message }) => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    setTypedText(''); // Reset on new message
    const typingInterval = setInterval(() => {
      if (index < message.content.length) {
        setTypedText(prev => prev + message.content.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 5); // Typing speed

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, [message]);

  return (
    <>
    <p className='live-message-text'>
      <strong className="message-sender-prefix">{`> ${message.senderId.toUpperCase() == 'NARRATOR' ? 'SOCRATES' : 'PLATO'}:`}</strong>
      {' '}
      <span className="live-message-content">{typedText}</span>
      <span className="cursor">{showCursor ? '█' : ''}</span>
    </p>
    <PumpMessages message={message} />
    </>
  );
};

interface ActiveRoomProps {
  room: Room | undefined;
}

const ActiveRoom: React.FC<ActiveRoomProps> = ({ room }) => {
  const messageListRef = useRef<HTMLDivElement>(null);

  // Subscribe to the messages for the active room
  const { messages, isLoading } = useTracker(() => {
    if (!room?._id) {
        return {
            messages: [],
            isLoading: true
        };
    }
    const handle = Meteor.subscribe('realityShard', room?._id);
    const ready = handle.ready();
    if (!ready) {
        return {
            messages: [],
            isLoading: true
        };
    }
    const messages = Messages.find({ roomId: room._id }, { sort: { timestamp: 1 } }).fetch() as Message[];
    return { messages, isLoading: !handle.ready() };
  }, [room?._id]);

  console.log("Messages in active room: " + messages.length);
  console.log("Active room is " + isLoading ? "loading" : "loaded");
  

  // Handle auto-scrolling to the bottom on new messages
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading || !room) {
    return <LoadingScreen />;
  }
  return (
    <div className="active-room-container">
      <div ref={messageListRef} className="live-message-list">
        {messages.length > 0 ? messages.map((message, index) => (
          <div key={message._id} className="live-message-item">
            {index === messages.length - 1 ? (
              <MessageWithTyping message={message} />
            ) : (
              <>
              <p className='live-message-text'>
                <strong className="message-sender-prefix">{`> ${message.senderId.toUpperCase() == 'NARRATOR' ? 'SOCRATES' : 'PLATO'}:`}</strong>
                {' '}
                <span className="live-message-content">{message.content}</span>
                <hr/>
              </p>
                <PumpMessages message={message}/>
                </>
            )}
          </div>
        ))
        : <div className='live-message-content text-glow'>Awaiting first message...</div>}
      </div>
    </div>
  );
};

export function PumpMessages({message} : {message: Message}) {
    return (<div className='pump-messages'>
        <h3>pump.fun</h3>
        {message.pumpMessages?.map((message, id) => (<p key={id}>{truncateName(message.sender)}: {message.text}</p>))}
    </div>);
}

function truncateName(name: string) {
    if (name.length < 8) {
        return name;
    }
    return name.substring(0, 7);
}

export default ActiveRoom;
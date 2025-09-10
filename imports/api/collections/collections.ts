import { Mongo } from 'meteor/mongo';

// 📚 Define a TypeScript interface for our Room documents
export interface Room {
  _id: string;
  status: 'active' | 'archived';
  echo: string;
  previousRoomId?: string;
  observerMessageCount: number;
  createdAt: Date;
}

export interface NewRoom extends Omit<Room, '_id'> {
  _id?: string; 
}

// 💬 Define a TypeScript interface for our Message documents
export interface Message {
  _id: string;
  roomId: string;
  senderId: string; // 'narrator' or 'observer'
  content: string;
  pumpMessages: PumpMessage[]
  timestamp: Date;
}

export interface PumpMessage {
    sender: string,
    text: string
}

export interface NewMessage extends Omit<Message, '_id'> {
  _id?: string; 
}

// Create the collections, specifying their types
export const Rooms = new Mongo.Collection<NewRoom, Room>('rooms');
export const Messages = new Mongo.Collection<NewMessage, Message>('messages');
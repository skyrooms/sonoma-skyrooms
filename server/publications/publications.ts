import { Meteor } from 'meteor/meteor';
import { Rooms, Messages } from '../../imports/api/collections/collections';

// 1. Publication for the single active room
Meteor.publish('activeRoom', function activeRoomPublication() {
  return Rooms.find({ status: 'active' });
});

// 2. Publication for a single reality shard (archived room)
Meteor.publish('realityShard', function realityShardPublication(roomId: string) {
  // Ensure the roomId parameter is a string for security
  if (typeof roomId !== 'string') {
    this.ready();
    return;
  }
  // Return the messages for the specified room
  return Messages.find({ roomId });
});

// 3. Publication for the list of archived rooms (reality shards)
Meteor.publish('archivedRooms', function archivedRoomsPublication() {
  return Rooms.find({ status: 'archived' });
});
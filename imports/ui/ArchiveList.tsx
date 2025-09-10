import React from 'react';
import { Room, Rooms } from '../../imports/api/collections/collections';
import moment from 'moment';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import LoadingScreen from './LoadingScreen';

interface ArchiveListProps {
  onSelectShard: (roomId: string) => void;
}

const ArchiveList: React.FC<ArchiveListProps> = ({onSelectShard}) => {
    const { archivedRooms: rooms, isLoadingArchivedRooms: isReady } = useTracker(() => {
        const archivedRoomsHandle = Meteor.subscribe('archivedRooms');
        const ready = archivedRoomsHandle.ready();
        if (!ready) {
            return {
                archivedRooms: [],
                isLoadingArchivedRooms: true
            };
        }
        const rooms = Rooms.find({status: 'archived'}, { sort: { createdAt: -1 } }).fetch();
        return { archivedRooms: rooms, isLoadingArchivedRooms: ready };
    });
    console.log(rooms);
    
    return (
        <div className="archive-container">
            <ul className="archive-list">
                {
                    !isReady ? (<LoadingScreen/>) :
                    rooms.map((room) => (
                        <li
                            key={room._id}
                            className="archive-list-item"
                            onClick={() => onSelectShard(room._id)}
                        >
                            <div className='archive-item-header'>
                                <span className="archive-item-date">{moment(room.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                                <span className="archive-item-id">[{room._id.substring(0, 8)}]</span>
                            </div>
                            <p className="archive-item-echo">{room.echo}</p>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
};

export default ArchiveList;
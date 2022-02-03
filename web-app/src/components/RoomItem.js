import React from "react";




const RoomItem = ({room, active, onClick}) => {

    return (
        <div className={`room-item ${active ? 'active' : ''}`} onClick={onClick}>
            <div className={'room-item__header'}>{room.name}</div>
            <div className={'room-item__subheader'}>{room.createdAt ? new Date(room.createdAt * 1000).toUTCString() : ''}</div>
            <div className={'room-item__info'}>
                {room?.users?.length || 0}/5
            </div>
        </div>
    );
}

export default RoomItem;


package raze.spring.webrtc.services;

import raze.spring.webrtc.domain.Room;
import raze.spring.webrtc.exceptions.RoomException;

import java.util.Set;

public interface RoomService {



    void addRoom(Room room) throws RoomException;

    void removeRoom(String name) throws RoomException;

    Set<Room> getRooms();
    Set<String> getRoomUsers(String name) throws RoomException;
    Room getRoom(String name) throws RoomException;

    void addUserToRoom(String username, String roomName) throws RoomException;


    void leaveRoom(String username, String roomName) throws RoomException;

    void removeUser(String username) throws RoomException;


}

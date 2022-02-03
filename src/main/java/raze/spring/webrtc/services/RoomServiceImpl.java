package raze.spring.webrtc.services;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Service;
import raze.spring.webrtc.domain.Room;
import raze.spring.webrtc.exceptions.RoomException;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;


@Service
public class RoomServiceImpl implements RoomService {

    public final static  Integer MAX_ROOMS = 50;

    private LoadingCache<String, Room> rooms; // <name, room>

    private Map<String, String> userToRoom = new ConcurrentHashMap<>();

    public RoomServiceImpl() {
        rooms = CacheBuilder.newBuilder().

                expireAfterWrite(1, TimeUnit.DAYS).maximumSize(MAX_ROOMS)
                .build(new CacheLoader<String, Room>() {
                    @Override
                    public Room load(String key) throws Exception {
                        return null;
                    }
                });


    }


    @Override
    public void addRoom(Room room) throws RoomException {
        final String name = room.getName();
//        if(name == null || name.length() == 0) throw new IllegalStateException("invalid room name");
        if(name == null || name.length() == 0) throw new RoomException( "invalid room name");
        final Room ro =  rooms.getIfPresent(name);
        if(ro != null) throw  new RoomException( "room with this name already exist");
        rooms.put(name , room);
    }

    @Override
    public void removeRoom(String name) throws RoomException {
//        if(name == null || name.length() == 0) throw new IllegalStateException("invalid room name");
        if(name == null || name.length() == 0) throw  new RoomException( "invalid room name");;
        rooms.invalidate(name);
    }

    @Override
    public Set<Room> getRooms() {
        return new HashSet<>(rooms.asMap().values());
    }

    @Override
    public Set<String> getRoomUsers(String name) throws RoomException {
        final Room room = rooms.getIfPresent(name);
//        if(room == null) throw new IllegalStateException("room not found");
        if(room == null) throw new RoomException("room not found");
        return room.getUsers();
    }

    @Override
    public Room getRoom(String name) throws RoomException {
        final Room room = rooms.getIfPresent(name);
//        if(room == null) throw new IllegalStateException("room not found");
        if(room == null) throw new RoomException( "room not found");
        return  room;
    }

    @Override
    public void addUserToRoom(String username, String roomName) throws RoomException {
        userToRoom.put(username, roomName);
        final Room room = rooms.getIfPresent(roomName);
//        if(room == null) throw new IllegalStateException("room not found");
        if(room == null) throw new RoomException( "room not found");
        final boolean su = room.addUser(username);
        if(!su)  throw new RoomException( "room is full");
        rooms.put(roomName, room);

    }

    @Override
    public void leaveRoom(String username, String roomName) throws RoomException {
        final Room room = rooms.getIfPresent(roomName);
//        if(room == null ) throw new IllegalStateException("room not found");
        if(room == null ) throw new RoomException( "room not found");
        room.removeUser(username);
        rooms.put(roomName, room);

        userToRoom.remove(username, roomName);
    }

    @Override
    public void removeUser(String username) throws RoomException {
        final String roomName = userToRoom.get(username);
        if(roomName == null) return;
        final Room room = rooms.getIfPresent(roomName);

//        if(room == null) throw new IllegalStateException("room not found");
        if(room == null) throw new RoomException( "room not found");
        room.removeUser(username);
        rooms.put(roomName, room);

        userToRoom.remove(username);

    }


}

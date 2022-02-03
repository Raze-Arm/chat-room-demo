package raze.spring.webrtc.socket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import raze.spring.webrtc.domain.Room;
import raze.spring.webrtc.exceptions.RoomException;
import raze.spring.webrtc.domain.SocketMessage;
import raze.spring.webrtc.services.RoomService;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@AllArgsConstructor
public class WebSocketHandler extends TextWebSocketHandler {
    private final RoomService roomService;

    private final ObjectMapper objectMapper;



    private final Map<String , WebSocketSession> usernameToSession = new ConcurrentHashMap<>(); //TODO

    private final LoadingCache<Map<String,String>, String> negotiations =
      CacheBuilder.newBuilder()
              .maximumSize(10000)
          .expireAfterWrite(10, TimeUnit.SECONDS)
          .build(
              new CacheLoader<Map<String,String>, String>() {
                @Override
                public String load(Map<String,String> key) throws Exception {
                  return null;
                }
              });

    public LoadingCache<Map<String, String>, String> getNegotiations() {
        return negotiations;
    }

    private static final String TEXT = "text";
    private static final String NEGOTIATE = "negotiate";
    private static final String RESET = "reset";
    private static final String OFFER = "offer";
    private static final String ANSWER = "answer";
    private static final String ICE = "ice";
    private static final String JOIN = "join";
    private static final String JOIN_ROOM = "join_room";
    private static final String LEAVE = "leave";
    private static final String STATE = "state";
    private static final String ADD_ROOM = "add_room";
    private static final String LEAVE_ROOM = "leave_room";

    private static final String PING  = "__ping__";

    private static final String ERROR = "error";
    private static final String ROOM_ERROR = "room_error";



    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.debug("[ws] Session has been closed with status {}", status);

        final String username = usernameToSession.entrySet()
                .stream()
                .filter(entry -> entry.getValue().equals(session))
                .map(Map.Entry::getKey)
                .findFirst().orElse(null);
        if(username != null) {
            usernameToSession.remove(username);
            roomService.removeUser(username);
            sendMessageToAllClients(SocketMessage.builder().from("SERVER").type(STATE).rooms(roomService.getRooms())
                .users(usernameToSession.keySet()).build());
        }


    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);


        sendMessage(session, SocketMessage.builder().from("SERVER").type(STATE).rooms(roomService.getRooms())
                .users(usernameToSession.keySet()).build());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        try{
            SocketMessage message = objectMapper.readValue(textMessage.getPayload() , SocketMessage.class);
            log.debug("[ws] message of {} type from  {} received, room : {} , data : {}", message.getType(), message.getFrom(), message.getRoom(), message.getData());
            String username = message.getFrom();
            String data= message.getData();


            switch (message.getType()) {
                case PING: {
                    if(session.isOpen()) session.sendMessage(new TextMessage(objectMapper
                            .writeValueAsString(SocketMessage.builder().type("__pong__").build())));
                    break;
                }
                case TEXT: {
                    sendMessageToRoomClients(message.getRoom()
                            , SocketMessage.builder().from(username).type(TEXT).data(data).build());
                    break;
                }
                case ADD_ROOM: {
                    final Room newRoom  = Room.builder().name(data).createdAt(Instant.now()).build();
                    roomService.addRoom(newRoom);
                    sendMessageToAllClients(SocketMessage.builder().type(STATE)
                            .rooms(roomService.getRooms()).users(usernameToSession.keySet()).build());
                    break;
                }
                case NEGOTIATE:{

                    final  String  room = negotiations.getIfPresent(Map.of(data , username));
                    if(room != null) {
//                        negotiations.invalidate(Map.of(data , username));
                        final boolean isGr = username.compareTo(data) > 0;
                        log.error("SENDING NEGOTIATE MESSAGE  {}", username);
                        if(isGr)
                            sendMessage(usernameToSession.get(data), SocketMessage.builder().from(username).room(room)
                                    .type(NEGOTIATE).build());
                        else
                            sendMessage(session, SocketMessage.builder().from(data).room(room)
                                    .type(NEGOTIATE).build());
                    } else {
                        negotiations.put(Map.of(username, data), message.getRoom());
                    }


                    break;
                }
                case RESET: {
                    final WebSocketSession socketSession = usernameToSession.get(data);
                    if(socketSession != null) {
                        sendMessage(socketSession, SocketMessage.builder().from(username).type(RESET)
                                .data(data).room(message.getRoom()).build());
                    }

                    break;
                }
                case OFFER:
                case ANSWER:
                case ICE: {
                    Object candidate = message.getCandidate();
                    Object sdp = message.getSdp();

                   String roomName = message.getRoom();
                   if(roomName != null) {
                       final WebSocketSession socketSession = usernameToSession.get(data);
                       if(socketSession != null ) {
                           sendMessage(socketSession  , SocketMessage.builder().from(username).type(message.getType())
                                   .sdp(sdp).candidate(candidate).room(roomName).build());
                       }
                   }
                    break;
                }
                case JOIN:{
                    final WebSocketSession se = usernameToSession.putIfAbsent(username, session);
                    if(se != null)  sendMessage(session, SocketMessage.builder().type(ERROR).data("user with this name already exist").build());
                    sendMessageToAllClients(
                            SocketMessage.builder()
                                    .from("SERVER")
                                    .type(STATE)
                                    .users(usernameToSession.keySet())
                                    .rooms(roomService.getRooms())
                                    .build());
                    break;
                }
                case JOIN_ROOM: {
                    log.debug("[ws] {} has joined the Room: {} ", username, data);

                    roomService.addUserToRoom(username, data);
                    sendMessageToAllClients(                        SocketMessage.builder()
                            .from("SERVER")
                            .type(STATE)
                            .users(usernameToSession.keySet())
                            .rooms(roomService.getRooms())
                            .build());

                    break;
                }
                case LEAVE_ROOM: {
                    roomService.leaveRoom(username, message.getRoom());
                    sendMessageToAllClients(SocketMessage.builder()
                            .from("SERVER")
                            .type(STATE)
                            .users(usernameToSession.keySet())
                            .rooms(roomService.getRooms())
                            .build());

                    break;
                }
                case LEAVE: {
                    usernameToSession.remove(username);
                    roomService.removeUser(username);

                    break;
                }

                default:{
                    log.debug("[ws] type of the received message {} is undefined", message.getType());
                }

            }

        } catch (IOException | RoomException e) {
            if(e instanceof RoomException) {
                sendMessage(session, SocketMessage.builder().from("SERVER").type(ROOM_ERROR)
                        .data(((RoomException) e).getMessage()).build());
            }
            log.debug("Error : {}", e.getMessage());
        }
    }


    private void sendMessage(WebSocketSession session, SocketMessage message) {
        try{
            String json = objectMapper.writeValueAsString(message);
           if(session.isOpen()) {
               synchronized (session) {
                   session.sendMessage(new TextMessage(json));
               }
           }
        } catch (IOException e) {
            log.debug("Error : {}", e.getMessage());
        }
    }

    private void sendMessageToAllClients(SocketMessage message) {
        try{
            String json = objectMapper.writeValueAsString(message);

            usernameToSession.values().forEach(session -> {
                try {
                    if(session != null && session.isOpen() )session.sendMessage(new TextMessage(json));
                } catch (IOException e) {
                    log.debug("Error : {}", e.getMessage());
                }
            });
        }catch (IOException e) {
            log.debug("Error : {}", e.getMessage());
        }

    }

    private void sendMessageToRoomClients(String roomName, SocketMessage message) {
        try{
            String json = objectMapper.writeValueAsString(message);
            roomService.getRoomUsers(roomName).forEach(username -> {
                try {
                    final WebSocketSession session = usernameToSession.get(username);
                    if(session != null && session.isOpen()) session.sendMessage(new TextMessage(json));
                } catch (IOException e) {
                    log.debug("Error : {}", e.getMessage());
                }
            });

        }catch (IOException | RoomException e) {
            log.debug("Error : {}", e.getMessage());
        }
    }


}


@Setter
@Getter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
class NegotiateRequest {
    private String from;
    private String to;
}





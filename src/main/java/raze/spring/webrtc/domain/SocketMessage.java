package raze.spring.webrtc.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SocketMessage {
    private String from;
//    private String to;
    private String room;
    private String type;
    private String data;
    private Set<Room> rooms;
//    private Set<Client> clients;
    private Set<String> users;
    private Object candidate;
    private Object sdp;


}

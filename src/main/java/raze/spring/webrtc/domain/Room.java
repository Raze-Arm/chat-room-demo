package raze.spring.webrtc.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import raze.spring.webrtc.utility.FixedHashSet;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Room {
//    private String id;

    private String name;   //TODO  replace id with name

    private Set<String> users = new FixedHashSet<>(5);




    private Instant createdAt;


    public Set<String> getUsers() {
        if(users == null) return new FixedHashSet<>(5);
        return users;
    }


    public boolean addUser(String username) {
        if(users == null) this.users = new FixedHashSet<>(5);
        if(users.size() >= 5) return false;
        return this.users.add(username);
    }

    public void removeUser(String username) {
        users.remove(username);
    }

}

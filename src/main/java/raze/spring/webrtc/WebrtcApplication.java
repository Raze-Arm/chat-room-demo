package raze.spring.webrtc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.socket.config.annotation.EnableWebSocket;



@SpringBootApplication
@EnableWebSocket
public class WebrtcApplication {



    public static void main(String[] args) {
        SpringApplication.run(WebrtcApplication.class, args);
    }

}




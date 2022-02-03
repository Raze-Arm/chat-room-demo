FROM maven:3.8.4-jdk-11
#FROM amazoncorretto:11

RUN mkdir   -p spring-app/
WORKDIR /spring-app
COPY . /spring-app
#COPY target/webrtc-0.0.1-SNAPSHOT.jar /spring-app/webrtc.jar

RUN mvn clean package

ENTRYPOINT ["mvn" , "spring-boot:run"]
#ENTRYPOINT ["java", "-jar" , "/spring-app/webrtc.jar"]
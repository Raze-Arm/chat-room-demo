# chat-room-demo
spring chat room with video chat using react and webrtc


### Preview

<img width="1324" alt="Screenshot 2022-02-02 at 19 09 03" src="https://user-images.githubusercontent.com/79927358/152383772-d1a80e06-ae55-4f7d-a28f-611c62e49c0d.png">

### Local Development

To setup this project locally for development purposes please follow the following steps:

1. Ensure your maven installed. [See](https://maven.apache.org/download.cgi)

2. Clone this repo by running the command - `git clone https://github.com/Raze-Arm/chat-room-demo.git`

3. Navigate to the directory where the repo is cloned to. (e.g `cd igdm`)

4. Run `mvn clean` package.

5. Start the application locally by running `mvn spring-boot:run`

### Docker instruction

1. Ensure your docker installed. [See](https://www.docker.com/products/docker-desktop)

2. Run docker build -t demo .

3. Run docker run -p 8080:8080 demo

That's it! :D

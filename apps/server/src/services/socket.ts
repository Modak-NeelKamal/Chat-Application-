import { Server } from "socket.io";
import Redis from "ioredis";

const pub = new Redis({
  host: "redis-13804.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 13804,
  username: "default",
  password: "Cf82RLZKFYW0S8E6WXhNF2vVXaFx1Bcv",
});

const sub = new Redis({
  host: "redis-13804.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 13804,
  username: "default",
  password: "Cf82RLZKFYW0S8E6WXhNF2vVXaFx1Bcv",
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Service");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    // Subscribe to Redis channel for messages
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners");

    io.on("connect", (socket) => {
      console.log(`New client connected: ${socket.id}`);

      // Handle message event from client
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log(`Message received: ${message}`);

        // Publish the message to Redis
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    // Listen for messages on the Redis subscription
    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("New message from Redis:", message);

        // Parse message from Redis and emit it back to all connected clients
        const parsedMessage = JSON.parse(message);
        io.emit("event:message", parsedMessage); // Emit using "event:message"
      }
    });
  }

  // Getter for the IO server
  get io() {
    return this._io;
  }
}

export default SocketService;

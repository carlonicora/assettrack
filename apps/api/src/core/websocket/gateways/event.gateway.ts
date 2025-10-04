import { UseInterceptors } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { ClsInterceptor, ClsService } from "nestjs-cls";
import { Server, Socket } from "socket.io";
import { AppLoggingService } from "src/core/logging/services/logging.service";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";
import { WebSocketService } from "src/core/websocket/services/websocket.service";

@WebSocketGateway({
  path: "/socket.io",
  cors: {
    origin: "*",
    credentials: true,
  },
  transports: ["websocket"],
})
@UseInterceptors(ClsInterceptor)
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly jwtService: JwtService,
    private readonly cls: ClsService,
    private readonly neo4j: Neo4jService,
    private readonly logger: AppLoggingService,
  ) {}

  afterInit() {
    this.webSocketService.setServer(this.server);
    this.logger.log("WebSocket server initialized");
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      client.data.user = { userId: null };
      return;
    } else {
      try {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        this.webSocketService.addClient(payload.userId, client);
        // this.logger.log(`Client connected: ${client.id}, userId: ${payload.userId}`);
      } catch (err) {
        this.logger.error(`JWT verification failed for client: ${client.id}, error: ${err.message}`);
        // Instead of disconnecting, set userId to null and continue
        client.data.user = { userId: null };
      }
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user && user.userId) {
      this.webSocketService.removeClient(user.userId, client);
      // this.logger.log(`Client disconnected: ${client.id}, userId: ${user.userId}`);
    }
  }

  @SubscribeMessage("message")
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any): void {
    const user = client.data.user;
    this.logger.log(`Received message from userId ${user.userId}: ${JSON.stringify(payload)}`);

    // Process the message as needed
    this.webSocketService.handleIncomingMessage(user.companyId, user.userId, payload);

    // Send a response back to the client
    // client.emit("message", { message: "Message received" });
  }

  @SubscribeMessage("audio")
  async handleAudio(@MessageBody() payload: any, @ConnectedSocket() client: Socket): Promise<void> {
    const user = client.data.user;

    this.cls.set("userId", client.data.user.userId);
    this.cls.set("companyId", client.data.user.companyId);

    const wrappedPayload = { type: "audio", message: payload };
    this.webSocketService.handleIncomingMessage(user.companyId, user.userId, wrappedPayload);
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const token = client.handshake.auth?.token;

    if (token) return token as string;

    const queryToken = client.handshake.query.token;
    const authHeader = client.handshake.headers.authorization;

    if (queryToken) {
      return queryToken as string;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return null;
  }
}

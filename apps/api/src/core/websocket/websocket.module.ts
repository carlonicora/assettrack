import { Module } from "@nestjs/common";
import { EventsGateway } from "src/core/websocket/gateways/event.gateway";
import { WsJwtGuard } from "src/core/websocket/guards/ws.jwt.auth.guard";
import { WebSocketService } from "src/core/websocket/services/websocket.service";

@Module({
  controllers: [],
  providers: [EventsGateway, WebSocketService, WsJwtGuard],
  exports: [WebSocketService],
})
export class WebsocketModule {}

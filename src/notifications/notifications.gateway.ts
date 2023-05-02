import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { parse } from 'cookie';
import { AuthSocket, WSAuthMiddleware } from './auth/ws-auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { ENotificationType } from 'src/common/constants/notification-type.enum';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async afterInit(server: Server) {
    const authMiddleware = WSAuthMiddleware(this.jwtService);
    server.use(authMiddleware);
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    const userId = client.user.id;

    if (this.clients.has(userId)) {
      const existingClient = this.clients.get(userId);
      existingClient.disconnect();
    }

    this.clients.set(userId, client);
  }

  handleDisconnect(client: AuthSocket) {
    this.clients.delete(client.user.id);
  }

  async sendNotification(
    initiatorId: string,
    receiverId: string,
    type: ENotificationType,
    refId: string,
    refType = 'post',
  ) {
    const notification = await this.notificationsService.createNotification(
      initiatorId,
      receiverId,
      refId,
      type,
    );

    const receiverSocket = this.clients.get(receiverId);
    if (receiverSocket) {
      receiverSocket.emit('notification', notification);
    }
  }
}

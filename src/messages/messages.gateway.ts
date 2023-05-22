import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthSocket, WSAuthMiddleware } from '../auth/ws-auth.middleware';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();

  constructor(private readonly jwtService: JwtService) {}

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

  async sendMessage(message: any) {
    const receiverSocket = this.clients.get(message.to._id.toString());
    if (receiverSocket) {
      receiverSocket.emit('message', message);
    }
  }
}

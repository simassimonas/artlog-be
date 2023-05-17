import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

export interface AuthSocket extends Socket {
  user: { id: string };
}
export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;

export const WSAuthMiddleware = (jwtService: JwtService): SocketMiddleware => {
  return async (socket: AuthSocket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      const parsedCookies = parse(cookies);
      const jwtToken = parsedCookies['access_token'];
      const jwtPayload = jwtService.verify(jwtToken);

      socket.user = { id: jwtPayload.sub };
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  };
};

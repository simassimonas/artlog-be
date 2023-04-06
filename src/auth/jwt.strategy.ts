require('dotenv').config();

import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // JWT validation is done automatic by passport-jwt
    // Here you can additional validation logic (eg. check user id in database) and return what you want to the request object
    // This happens during JWT validation
    return {
      id: payload.sub,
      name: payload.name,
    };
  }

  private static extractJWT(req: any): string | null {
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    }
    return null;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/schemas/users.schema';
import { IPublicUser } from 'src/common/interfaces/public-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user: User = await this.usersService.getUserByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...publicUser } = user;
      return publicUser;
    }

    return null;
  }

  async login(user: any, res: any) {
    // This happens during login after user is checked in database (by local strategy)
    const payload = { name: user.username, sub: user._id };
    const jwtToken = this.jwtService.sign(payload);
    res.cookie('access_token', jwtToken, { maxAge: 86400000, httpOnly: true });
    return {
      message: 'Login successful',
      username: user.username,
      user_id: user._id,
    };
  }

  async logout(res: any) {
    // This happens during login after user is checked in database (by local strategy)
    res
      .clearCookie('access_token', {
        secure: true,
        sameSite: 'none',
      })
      .status(200)
      .json({ message: 'Logout successful' });
  }

  async register(createUserDto: CreateUserDto): Promise<IPublicUser> {
    // This happens during registration
    const user: User = await this.usersService.createUser(createUserDto);
    const { password, ...publicUser } = user;
    return publicUser;
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IPublicUser } from 'src/common/interfaces/public-user.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<IPublicUser> {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    return this.authService.login(req.user, res);
  }

  @Get('logout')
  async logout(@Res() res) {
    this.authService.logout(res);
  }

  @Get('test')
  async getTest() {
    return 'auth controller test';
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-protected')
  getHello(@Request() req) {
    return req.user;
  }
}

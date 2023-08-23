import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private configService: ConfigService,
  ) {}
  authenticate(email: string, password: string) {
    return this.userService.authenticate({
      email,
      password,
    });
  }

  async login(user: UserEntity) {
    const token = this.jwtService.sign({ id: user.id });
    await this.tokenService.upsertToken(token, user);
    return {
      user,
      token,
    };
  }

  public getCookieWithJwtToken(token: string) {
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRES_IN',
    )}`;
  }

  getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}

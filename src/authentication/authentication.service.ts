import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  authenticate(email: string, password: string) {
    return this.userService.authenticate({
      email,
      password,
    });
  }

  async login(user: UserEntity) {
    const token = await this.jwtService.sign({ id: user.id });
    return {
      user,
      token,
    };
  }

  public getCookieWithJwtToken(token: string) {
    console.log(
      `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
        'JWT_EXPIRES_IN',
      )}`,
    );
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRES_IN',
    )}`;
  }

  getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}

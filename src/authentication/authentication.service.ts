import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
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
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}
  authenticate(email: string, password: string) {
    return this.userService.authenticate({
      email,
      password,
    });
  }

  async login(user: UserEntity) {
    const token = this.jwtService.sign({ id: user.id });
    const cacheKey = this.configService.get('USER_TOKEN_CACHE_KEY');
    this.cacheService.set(`${cacheKey}:${user.id}`, token);
    // await this.tokenService.upsertToken(token, user);
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

  logout(user: UserEntity) {
    const userKey = this.configService.get(
      EnvironmentConstants.USER_TOKEN_CACHE_KEY,
    );
    return this.cacheService.del(`${userKey}:${user.id}`);
  }
}

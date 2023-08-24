import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
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
    const cacheKey = this.configService.get(
      EnvironmentConstants.USER_TOKEN_CACHE_KEY,
    );
    const jwt_expiration_time = this.configService.get<number>(
      EnvironmentConstants.JWT_EXPIRES_IN,
    );
    console.log(jwt_expiration_time);
    this.cacheService.set(`${cacheKey}:${user.id}`, token, {
      ttl: jwt_expiration_time,
    } as any);
    return {
      user,
      token,
    };
  }

  public getCookieWithJwtToken(token: string) {
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      EnvironmentConstants.JWT_EXPIRES_IN,
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

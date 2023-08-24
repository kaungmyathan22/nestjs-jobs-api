import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import * as jsonwebtoken from 'jsonwebtoken';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthenticationGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Add your JWT validation logic here
    const req: Request = context.switchToHttp().getRequest();
    const cookieToken = req.cookies['Authentication']; // Attempt to get token from cookies
    const bearerToken = req.headers.authorization;
    const headerToken = bearerToken && bearerToken.split('Bearer ')[1];
    const token = headerToken || cookieToken;
    if (!token) {
      return false; // No token provided, deny access
    }
    try {
      const result = jsonwebtoken.verify(
        token,
        this.configService.get('JWT_SECRET'),
      ) as JwtPayload;
      const cacheKey = this.configService.get(
        EnvironmentConstants.USER_TOKEN_CACHE_KEY,
      );
      const token_from_cache = await this.cacheService.get(
        `${cacheKey}:${result.id}`,
      );
      if (token_from_cache) {
        const isMatch = token_from_cache === token;
        if (!isMatch) {
          return false;
        }
        const user = await this.userService.findOne(result.id);
        req.user = user;
        return isMatch;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  }
}

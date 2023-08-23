import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as jsonwebtoken from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { TokenEntity } from '../entities/token.entity';

@Injectable()
export class JwtAuthenticationGuard implements CanActivate {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    private configService: ConfigService,
    private userService: UsersService,
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
      const tokenInstance = await this.tokenRepository.findOne({
        where: { user: { id: result.id } },
      });
      if (tokenInstance) {
        const isMatch = await tokenInstance.isTokenMatch(token);
        if (!isMatch) {
          return false;
        }
        const user = await this.userService.findOne(result.id);
        req.user = user;
        return isMatch;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

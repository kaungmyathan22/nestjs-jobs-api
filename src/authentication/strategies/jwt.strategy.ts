import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

const jwtFromRequest: JwtFromRequestFunction = (request: Request) => {
  let token = null;

  if (request.headers.authorization) {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.cookies && request.cookies.jwtToken) {
    token = request.cookies.jwtToken;
  }

  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.userService.findOne(payload.id);
      if (!user) {
        throw new HttpException('Invalid user id.', HttpStatus.UNAUTHORIZED);
      }
      return user;
    } catch (error) {
      return false;
    }
  }
}

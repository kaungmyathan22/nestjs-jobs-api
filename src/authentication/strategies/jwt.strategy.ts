import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookieToken = req.cookies['Authentication']; // Attempt to get token from cookies
        const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req); // Attempt to get token from headers
        console.log({
          headerToken,
          cookieToken,
          flag: headerToken || cookieToken,
        });
        return headerToken || cookieToken;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log(payload);
    return this.userService.findOne(payload.id);
  }
}

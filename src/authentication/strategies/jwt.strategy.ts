import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookieToken = req.cookies['Authentication']; // Attempt to get token from cookies
        const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req); // Attempt to get token from headers
        return headerToken || cookieToken;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const token = this.jwtService.sign({ id: payload.id });
    console.log({ token });
    return this.userService.findOne(payload.id);
  }
}

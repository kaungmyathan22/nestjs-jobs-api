import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthenticationService } from './authentication.service';
import JwtAuthenticationGuard from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('api/v1/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request) {
    const result = await this.authenticationService.login(
      req.user as UserEntity,
    );
    req.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieWithJwtToken(result.token),
    );
    return result;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logOut(@Req() req: Request) {
    req.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    return { success: true };
  }
}

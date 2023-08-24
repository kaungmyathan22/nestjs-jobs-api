import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    private configService: ConfigService,
  ) {}
  async upsertToken(refresh_token: string, user: UserEntity) {
    const currentDate = new Date();
    const tokenExpirationTimeInMilliSecodns = +this.configService.get(
      EnvironmentConstants.JWT_REFRESH_EXPIRES_IN,
    );
    const expirationTime = new Date(
      currentDate.getTime() + tokenExpirationTimeInMilliSecodns,
    );

    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    const tokenInstance = await this.refreshTokenRepository.upsert(
      {
        user,
        refreshTokenHash,
        expirationTime,
      },
      ['user'],
    );
    return tokenInstance;
  }
  remove(user: UserEntity) {
    return this.refreshTokenRepository.delete({ user: { id: user.id } });
  }
}

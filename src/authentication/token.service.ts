import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenEntity } from './entities/token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    private configService: ConfigService,
  ) {}
  async upsertToken(token: string, user: UserEntity) {
    const currentDate = new Date();
    const tokenExpirationTimeInMilliSecodns =
      +this.configService.get('JWT_EXPIRES_IN');
    const expirationTime = new Date(
      currentDate.getTime() + tokenExpirationTimeInMilliSecodns,
    );

    let tokenInstance = await this.tokenRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (tokenInstance) {
      tokenInstance.expirationTime = expirationTime;
      tokenInstance.tokenHash = token;
    } else {
      tokenInstance = await this.tokenRepository.create({
        tokenHash: token,
        user,
        expirationTime,
      });
    }
    return this.tokenRepository.save(tokenInstance);
  }
  remove(user: UserEntity) {
    return this.tokenRepository.delete({ user: { id: user.id } });
  }
}

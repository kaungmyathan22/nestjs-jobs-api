import * as bcrypt from 'bcryptjs';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tokenHash: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @Column({
    type: 'timestamptz',
  })
  expirationTime: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashTokenBeforeInsert() {
    if (this.tokenHash) {
      this.tokenHash = await bcrypt.hash(this.tokenHash, 10);
    }
  }

  async isTokenMatch(plainText: string) {
    try {
      return bcrypt.compare(plainText, this.tokenHash);
    } catch (error) {
      return false;
    }
  }
}

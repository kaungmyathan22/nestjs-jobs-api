import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { JobModule } from './job/job.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [UsersModule, AuthenticationModule, JobModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

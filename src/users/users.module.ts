import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/user.repository';
import { UserMapper } from './mappers/user.mapper';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [UsersService, UserRepository, UserMapper],
  exports: [UsersService, UserRepository, UserMapper],
})
export class UsersModule {}

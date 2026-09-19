import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/services/users.service';
import { SecurityService } from '../services/security.service';
import { RegisterDto } from '@ROTA-TCC/types';
import { Email } from '../../common/domain/value-objects/email.vo';
import { Password } from '../../common/domain/value-objects/password.vo';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly securityService: SecurityService,
  ) {}
  
  async execute(registrationData: RegisterDto) {
    const email = new Email(registrationData.email);
    const password = new Password(registrationData.password);
    
    const hashedPassword = await this.securityService.hashPassword(
      password.toString(),
    );
    
    return this.userService.create({ ...registrationData, email: email.toString() },
      hashedPassword,
    );
  }
}

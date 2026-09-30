import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UserRepository) {}

  async create(data: any) {
    return await this.repository.create(data);
  }

  async findByToken(token: string) {
    return await this.repository.findByToken(token);
  }

  async updatePassword(id: string, password: string) {
    return await this.repository.update(id, { password });
  }

  async findByEmail(email: string) {
    return await this.repository.findUniqueByEmail(email);
  }

  async findFirstByEmailOrAlias(email: string, alias: string) {
    return await this.repository.findFirstByEmailOrAlias(email, alias);
  }

  async verifyEmail(token: string) {
    return await this.repository.verifyEmail(token);
  }
}

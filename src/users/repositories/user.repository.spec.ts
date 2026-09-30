import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should find unique user by email', async () => {
    const email = 'test@example.com';
    await repository.findUniqueByEmail(email);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
  });

  it('should find first user by email or alias', async () => {
    const email = 'test@example.com';
    const alias = 'test';
    await repository.findFirstByEmailOrAlias(email, alias);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ email }, { alias }] },
    });
  });

  it('should create a user', async () => {
    const data = { email: 'a@b.com', alias: 'a', password: 'hash' };
    await repository.create(data);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data,
      select: expect.any(Object),
    });
  });
});

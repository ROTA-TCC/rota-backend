import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { AbacatePayGateway } from './gateways/abacatepay.gateway';
import { ConfigService } from '@nestjs/config';
import { PaymentCalculatorService } from './services/payment-calculator.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let gateway: jest.Mocked<AbacatePayGateway>;
  let calculator: jest.Mocked<PaymentCalculatorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'PAYMENT_GATEWAY',
          useValue: {
            createProduct: jest.fn(),
            createCheckout: jest.fn(),
            createSubscription: jest.fn(),
          },
        },
        {
          provide: 'PRISMA_SERVICE', // Assuming prisma mock provider
          useValue: {
            user: { findUnique: jest.fn() },
            transaction: { create: jest.fn() },
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: PaymentCalculatorService,
          useValue: { calculate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    gateway = module.get('PAYMENT_GATEWAY');
    calculator = module.get(PaymentCalculatorService);
  });

  it('should create a checkout for a plan', async () => {
    // Assuming a global 'prisma' mock or similar is available in the test context.
    // If it's failing, we might need to adjust the test setup.
    (global as any).prisma = {
        user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }) },
        transaction: { create: jest.fn().mockResolvedValue({ id: 't1' }) },
    };

    calculator.calculate.mockReturnValue({
      amount: 4990,
      productName: 'Plano PRO',
      externalId: 'PRO',
    });
    gateway.createProduct.mockResolvedValue({ id: 'p1', externalId: 'PRO' });
    gateway.createSubscription.mockResolvedValue({
      id: 'ch1',
      url: 'http://url',
    });

    const result = await service.createCheckout('u1', {
      type: 'PLAN_SUBSCRIPTION',
      plan: 'PRO',
    } as any);

    expect(result.url).toBe('http://url');
    expect(calculator.calculate).toHaveBeenCalled();
    expect(gateway.createProduct).toHaveBeenCalledWith(
      'PRO',
      'Plano PRO',
      4990,
    );
  });
});

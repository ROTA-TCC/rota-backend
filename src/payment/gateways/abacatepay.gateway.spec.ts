import { Test, TestingModule } from '@nestjs/testing';
import { AbacatePayGateway } from './abacatepay.gateway';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

describe('AbacatePayGateway', () => {
  let gateway: AbacatePayGateway;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbacatePayGateway,
        {
          provide: HttpService,
          useValue: { request: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('mock-key') },
        },
      ],
    }).compile();

    gateway = module.get<AbacatePayGateway>(AbacatePayGateway);
    httpService = module.get(HttpService);
  });

  it('should create a product', async () => {
    httpService.request.mockReturnValue(
      of({ data: { data: { id: 'prod-123' } } }),
    );
    const product = await gateway.createProduct('ext-1', 'Product Name', 100);
    expect(product.id).toBe('prod-123');
  });

  it('should return product if it already exists', async () => {
    httpService.request.mockImplementationOnce(() => {
      throw { response: { data: { error: 'already exists' } } };
    });
    httpService.request.mockReturnValueOnce(
      of({ data: { data: [{ externalId: 'ext-1', id: 'prod-123' }] } }),
    );

    const product = await gateway.createProduct('ext-1', 'Name', 100);
    expect(product.id).toBe('prod-123');
  });
});

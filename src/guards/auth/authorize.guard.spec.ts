import { Test, TestingModule } from '@nestjs/testing';
import { AuthroizeGuard } from './authorize.guard';

describe('AuthGuard', () => {
  let service: AuthroizeGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthroizeGuard],
    }).compile();

    service = module.get<AuthroizeGuard>(AuthroizeGuard);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

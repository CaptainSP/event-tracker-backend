import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TypeOrmTest } from 'src/config/typeorm-test';
import { User } from 'src/controllers/users/entities/user.entity';
import { Role } from 'src/controllers/roles/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [
        TypeOrmTest([User,Role]),
        TypeOrmModule.forFeature([User,Role]),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

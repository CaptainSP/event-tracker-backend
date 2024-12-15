import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmTest } from 'src/config/typeorm-test';
import { User } from 'src/controllers/users/entities/user.entity';
import { Role } from 'src/controllers/roles/entities/role.entity';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
      imports: [TypeOrmTest([User,Role]),TypeOrmModule.forFeature([User,Role])],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

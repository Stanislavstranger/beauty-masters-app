import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { UserModule } from '../user/user.module';
import { AuthModule } from './auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { AccountLogin, AccountRegister } from '@./contracts';

const authLogin: AccountLogin.Request = {
  email: 'a1@a1.ru',
  password: '1',
};

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: authLogin.email,
};

describe('AuthController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'envs/.account.env',
        }),
        RMQModule.forTest({}),
        UserModule,
        AuthModule,
        MongooseModule.forRoot(
          'mongodb://admin:admin@localhost:27017/account?authSource=admin'
        ),
      ],
    }).compile();
    app = module.createNestApplication();
    userRepository = app.get<UserRepository>(UserRepository);
    rmqService = app.get(RMQService);
    await app.init();
  });

  it('Register', async () => {
    const res = await rmqService.triggerRoute<
      AccountRegister.Request,
      AccountRegister.Response
    >(AccountRegister.topic, authRegister);
    expect(res.email).toEqual(authRegister.email);
  }, 10000);

  it('Login', async () => {
    const res = await rmqService.triggerRoute<
      AccountLogin.Request,
      AccountLogin.Response
    >(AccountLogin.topic, authLogin);
    expect(res.access_token).toBeDefined();
  }, 10000);

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    await app.close();
  });
});

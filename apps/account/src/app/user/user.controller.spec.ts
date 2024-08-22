import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { AccountLogin, AccountRegister, AccountUserInfo } from '@./contracts';
import { verify } from 'jsonwebtoken';

const authLogin: AccountLogin.Request = {
  email: 'a1@a1.ru',
  password: '1',
};

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: authLogin.email,
};

describe('UserController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;
  let configService: ConfigService;
  let token: string;
  let userId: string;

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
    configService = app.get<ConfigService>(ConfigService);
    await app.init();

    await rmqService.triggerRoute<
      AccountRegister.Request,
      AccountRegister.Response
    >(AccountRegister.topic, authRegister);

    const { access_token } = await rmqService.triggerRoute<
      AccountLogin.Request,
      AccountLogin.Response
    >(AccountLogin.topic, authLogin);
    token = access_token;
    const data = verify(token, configService.get('JWT_SECRET_KEY'));
    userId = data['id'];
  });

  it('AccountUserInfo', async () => {
    const res = await rmqService.triggerRoute<
      AccountUserInfo.Request,
      AccountUserInfo.Response
    >(AccountUserInfo.topic, {
      id: userId,
    });
    expect(res.profile.displayName).toEqual(authRegister.displayName);
  }, 15000);

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    await app.close();
  }, 20000);
});

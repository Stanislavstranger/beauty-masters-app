import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import {
  AccountBuyBooking,
  AccountCheckPayment,
  AccountLogin,
  AccountRegister,
  AccountUserInfo,
  BookingGetBooking,
  PaymentCheck,
  PaymentGenerateLink,
  PaymentStatus,
} from '@./contracts';
import { verify } from 'jsonwebtoken';

const authLogin: AccountLogin.Request = {
  email: 'y1@y1.ru',
  password: '1',
};

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: authLogin.email,
};

const bookingId = 'bookingId';

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

  it('BuyBooking', async () => {
    const paymentLink = 'paymentLink';
    rmqService.mockReply<BookingGetBooking.Response>(BookingGetBooking.topic, {
      booking: {
        _id: bookingId,
        price: 1000,
      },
    });
    rmqService.mockReply<PaymentGenerateLink.Response>(
      PaymentGenerateLink.topic,
      {
        paymentLink,
      }
    );
    const res = await rmqService.triggerRoute<
      AccountBuyBooking.Request,
      AccountBuyBooking.Response
    >(AccountBuyBooking.topic, {
      bookingId,
      userId,
    });
    expect(res.paymentLink).toEqual(paymentLink);
    await expect(
      rmqService.triggerRoute<
        AccountBuyBooking.Request,
        AccountBuyBooking.Response
      >(AccountBuyBooking.topic, {
        bookingId,
        userId,
      })
    ).rejects.toThrow();
  }, 15000);

  it('BuyBooking', async () => {
    const status = PaymentStatus.Success;
    rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, {
      status,
    });
    const res = await rmqService.triggerRoute<
      AccountCheckPayment.Request,
      AccountCheckPayment.Response
    >(AccountCheckPayment.topic, {
      bookingId,
      userId,
    });
    expect(res.status).toEqual(status);
  }, 15000);

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    await app.close();
  }, 20000);
});

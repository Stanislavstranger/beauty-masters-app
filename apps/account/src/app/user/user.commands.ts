import {
  BadRequestException,
  Body,
  Controller,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import {
  AccountBuyBooking,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@./contracts';
import { RMQValidate, RMQRoute, RMQService } from 'nestjs-rmq';
import { THIS_USER_NOT_FOUND } from './user.constants';
import { UserEntity } from './entities/user.entity';
import { BuyBookingSaga } from './sagas/buy-booking.saga';

@Controller()
export class UserCommands {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService
  ) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async changeProfile(
    @Body() { id, user }: AccountChangeProfile.Request
  ): Promise<AccountChangeProfile.Response> {
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) {
      throw new BadRequestException(THIS_USER_NOT_FOUND);
    }
    const userEntity = await new UserEntity(existedUser).updateProfile(
      user.displayName
    );
    await this.userRepository.updateUser(userEntity);
    return;
  }

  @RMQValidate()
  @RMQRoute(AccountBuyBooking.topic)
  async buyBooking(
    @Body() { userId, bookingId }: AccountBuyBooking.Request
  ): Promise<AccountBuyBooking.Response> {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new BadRequestException(THIS_USER_NOT_FOUND);
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyBookingSaga(userEntity, bookingId, this.rmqService);
    const { user, paymentLink } = await saga.getState().pay();
    await this.userRepository.updateUser(user);
    return { paymentLink };
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(
    @Body() { userId, bookingId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new BadRequestException(THIS_USER_NOT_FOUND);
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyBookingSaga(userEntity, bookingId, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();
    await this.userRepository.updateUser(user);
    return { status };
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { THIS_USER_NOT_FOUND } from './user.constants';
import { UserEntity } from './entities/user.entity';
import { RMQService } from 'nestjs-rmq';
import {
  AccountBuyBooking,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@./contracts';
import { BuyBookingSaga } from './sagas/buy-booking.saga';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService
  ) {}
  async changeProfile({
    id,
    user,
  }: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
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

  async buyBooking({
    userId,
    bookingId,
  }: AccountBuyBooking.Request): Promise<AccountBuyBooking.Response> {
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

  async checkPayment({
    userId,
    bookingId,
  }: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
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

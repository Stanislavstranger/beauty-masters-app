import { AccountUserBookings, AccountUserInfo } from '@./contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(
    @Body() { id }: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    return { user };
  }

  @RMQValidate()
  @RMQRoute(AccountUserBookings.topic)
  async userBookings(
    @Body() { id }: AccountUserBookings.Request
  ): Promise<AccountUserBookings.Response> {
    const user = await this.userRepository.findUserById(id);
    return { bookings: user.bookings };
  }
}

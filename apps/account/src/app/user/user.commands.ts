import { Body, Controller } from '@nestjs/common';
import {
  AccountBuyBooking,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@./contracts';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserService } from './user.service';

@Controller()
export class UserCommands {
  constructor(private readonly userService: UserService) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async changeProfile(
    @Body() { id, user }: AccountChangeProfile.Request
  ): Promise<AccountChangeProfile.Response> {
    return this.userService.changeProfile({ id, user });
  }

  @RMQValidate()
  @RMQRoute(AccountBuyBooking.topic)
  async buyBooking(
    @Body() { userId, bookingId }: AccountBuyBooking.Request
  ): Promise<AccountBuyBooking.Response> {
    return this.userService.buyBooking({ userId, bookingId });
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(
    @Body() { userId, bookingId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayment({ userId, bookingId });
  }
}

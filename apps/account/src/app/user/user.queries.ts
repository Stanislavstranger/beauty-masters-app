import { AccountUserBookings, AccountUserInfo } from '@./contracts';
import { Body, Controller, Get } from '@nestjs/common';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';

@Controller('')
export class UserQueries {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService
  ) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(
    @Body() { id }: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    const profile = await new UserEntity(user).getPublicProfile();
    return { profile };
  }

  @RMQValidate()
  @RMQRoute(AccountUserBookings.topic)
  async userBookings(
    @Body() { id }: AccountUserBookings.Request
  ): Promise<AccountUserBookings.Response> {
    const user = await this.userRepository.findUserById(id);
    return { bookings: user.bookings };
  }

  @Get('healthcheck')
  async healthCheck() {
    const isRMQ = await this.rmqService.healthCheck();
    const user = await this.userRepository.healthCheck();
  }
}

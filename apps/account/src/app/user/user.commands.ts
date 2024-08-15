import { Body, Controller, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AccountChangeProfile } from '@./contracts';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { THIS_USER_NOT_FOUND } from './user.constants';
import { UserEntity } from './entities/user.entity';

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async changeProfile(
    @Body() { id, user }: AccountChangeProfile.Request
  ): Promise<AccountChangeProfile.Response> {
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) {
      throw new NotFoundException(THIS_USER_NOT_FOUND);
    }
    const userEntity = await new UserEntity(existedUser).updateProfile(
      user.displayName
    );
    await this.userRepository.updateUser(userEntity);
    return;
  }
}

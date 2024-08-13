import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import {
  INCORRECT_LOGIN,
  INCORRECT_PASSWORD,
  THIS_USER_ALREADY_REGISTERED,
} from './auth.constants';
import { UserEntity } from '../user/entities/user.entity';
import { IUser, UserRole } from '@./interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountLogin, AccountRegister } from '@./contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register({
    email,
    password,
    displayName,
  }: AccountRegister.Request, ): Promise<AccountRegister.Response> {
    const oldUser = await this.userRepository.findUser(email);
    if (oldUser) {
      throw new Error(THIS_USER_ALREADY_REGISTERED);
    }

    const newUserEntity = await new UserEntity({
      displayName,
      email,
      role: UserRole.Client,
    }).setPassword(password);

    const newUser = await this.userRepository.createUser(newUserEntity);
    return { email: newUser.email };
  }

  async validateUser({ email, password }: AccountLogin.Request): Promise<{
    id: Pick<IUser, '_id'>;
  }> {
    const user = await this.userRepository.findUser(email);
    if (!user) {
      throw new NotFoundException(INCORRECT_LOGIN);
    }

    const userEntity = new UserEntity(user);
    const isCorrectPassword = await userEntity.validatePassword(password);
    if (!isCorrectPassword) {
      throw new NotFoundException(INCORRECT_PASSWORD);
    }
    return { id: user._id };
  }

  async login(id: Pick<IUser, '_id'>): Promise<{ access_token: string }> {
    return {
      access_token: await this.jwtService.signAsync({ id }),
    };
  }
}

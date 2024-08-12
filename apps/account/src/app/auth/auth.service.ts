import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import {
  INCORRECT_LOGIN,
  INCORRECT_PASSWORD,
  THIS_USER_ALREADY_REGISTERED,
} from './auth.constants';
import { UserEntity } from '../user/entities/user.entity';
import { IUser, UserRole } from '@./interfaces';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

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
  }: RegisterDto, ): Promise<{ email: string }> {
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

  async validateUser({ email, password }: LoginDto): Promise<{
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

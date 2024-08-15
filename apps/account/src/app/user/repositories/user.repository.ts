import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.model';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { IUser } from '@./interfaces';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async createUser(user: UserEntity) {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async updateUser({ _id, ...rest }: UserEntity) {
    return this.userModel.updateOne({ _id }, { $set: { ...rest } }).exec();
  }

  async findUser(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserById(id: string): Promise<Omit<IUser, 'passwordHash'>> {
    return this.userModel
      .findById(id)
      .select({
        _id: true,
        displayName: true,
        email: true,
        passwordHash: false,
        role: true,
        bookings: true,
      })
      .exec();
  }

  async deleteUser(email: string): Promise<void> {
    this.userModel.deleteOne({ email }).exec();
  }
}

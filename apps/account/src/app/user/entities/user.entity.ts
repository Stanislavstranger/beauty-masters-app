import { IUser, IUserBookings, UserRole } from '@./interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: unknown;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  bookings?: IUserBookings[];

  constructor(user: Omit<IUser, 'passwordHash'>);
  constructor(user: IUser);

  constructor(user: IUser | Omit<IUser, 'passwordHash'>) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
    this.bookings = user.bookings;

    if ('passwordHash' in user) {
      this.passwordHash = user.passwordHash;
    }
  }

  public async setPassword(password: string): Promise<this> {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async validatePassword(password: string): Promise<boolean> {
    return compare(password, this.passwordHash);
  }
}

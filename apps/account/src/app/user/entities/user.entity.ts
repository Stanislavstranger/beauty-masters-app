import { IUser, IUserBookings, PurchaseState, UserRole } from '@./interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { SUCH_A_RESERVATION_ALREADY_EXISTS } from '../user.constants';
import { NotFoundException } from '@nestjs/common';

export class UserEntity implements IUser {
  _id?: string;
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

  private async isBookingExist(
    bookingId: string
  ): Promise<IUserBookings | undefined> {
    return this.bookings.find((booking) => booking._id === bookingId);
  }

  public async addBooking(bookingId: string) {
    if (this.isBookingExist(bookingId)) {
      throw new NotFoundException(SUCH_A_RESERVATION_ALREADY_EXISTS);
    }
    this.bookings.push({
      bookingId,
      purchaseState: PurchaseState.Started,
    });
  }

  public async deleteBooking(bookingId: string) {
    this.bookings = this.bookings.filter(
      (booking) => booking._id !== bookingId
    );
  }

  public async setBookingStatus(bookingId: string, state: PurchaseState) {
    if (!this.isBookingExist(bookingId)) {
      this.bookings.push({
        bookingId,
        purchaseState: state,
      });
      return this;
    }
    if (state === PurchaseState.Canceled) {
      this.deleteBooking(bookingId);
      return this;
    }
    this.bookings = this.bookings.map((booking) => {
      if (booking._id === bookingId) {
        booking.purchaseState = state;
        return booking;
      }
      return booking;
    });
    return this;
  }

  public async getPublicProfile(): Promise<
    Pick<IUser, 'email' | 'role' | 'displayName'>
  > {
    return {
      email: this.email,
      role: this.role,
      displayName: this.displayName,
    };
  }

  public async setPassword(password: string): Promise<this> {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async validatePassword(password: string): Promise<boolean> {
    return compare(password, this.passwordHash);
  }

  public async updateProfile(displayName: string): Promise<this> {
    this.displayName = displayName;
    return this;
  }
}

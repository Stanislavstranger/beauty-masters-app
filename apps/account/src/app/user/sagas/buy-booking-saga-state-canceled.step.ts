import { ConflictException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import {
  CANNOT_CANCEL_FOR_CANCELLED_BOOKING,
  CANNOT_CHECK_FOR_CANCELLED_BOOKING,
} from '../user.constants';
import { BuyBookingSagaState } from './buy-booking.state';
import { PurchaseState } from '@./interfaces';

export class BuyBookingSagaStateCanceled extends BuyBookingSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.bookingId);
    return this.saga.getState().pay();
  }
  public checkPayment(): Promise<{ user: UserEntity }> {
    throw new ConflictException(CANNOT_CHECK_FOR_CANCELLED_BOOKING);
  }
  public cancel(): Promise<{ user: UserEntity }> {
    throw new ConflictException(CANNOT_CANCEL_FOR_CANCELLED_BOOKING);
  }
}

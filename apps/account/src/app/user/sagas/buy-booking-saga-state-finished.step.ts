import { UserEntity } from '../entities/user.entity';
import {
  IT_IS_NOT_POSSIBLE_TO_CANCEL_A_PURCHASED_RESERVATION,
  IT_IS_NOT_POSSIBLE_TO_CHECK_THE_PAYMENT_OF_AN_ALREADY_PAID_BOOKING,
  YOU_CANNOT_PAY_FOR_AN_ALREADY_PAID_BOOKING,
} from '../user.constants';
import { BuyBookingSagaState } from './buy-booking.state';
import { ConflictException } from '@nestjs/common';

export class BuyBookingSagaStateFinished extends BuyBookingSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new ConflictException(YOU_CANNOT_PAY_FOR_AN_ALREADY_PAID_BOOKING);
  }
  public checkPayment(): Promise<{ user: UserEntity }> {
    throw new ConflictException(
      IT_IS_NOT_POSSIBLE_TO_CHECK_THE_PAYMENT_OF_AN_ALREADY_PAID_BOOKING
    );
  }
  public cancel(): Promise<{ user: UserEntity }> {
    throw new ConflictException(IT_IS_NOT_POSSIBLE_TO_CANCEL_A_PURCHASED_RESERVATION);
  }
}

import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import {
  THIS_BOOKING_NOT_EXIST,
  YOU_CANNOT_CHECK_A_PAYMENT_THAT_HAS_NOT_STARTED,
} from '../user.constants';
import { BuyBookingSagaState } from './buy-booking.state';
import {
  BookingGetBooking,
  PaymentGenerateLink,
  PaymentStatus,
} from '@./contracts';
import { PurchaseState } from '@./interfaces';

export class BuyBookingSagaStateStarted extends BuyBookingSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { booking } = await this.saga.rmqService.send<
      BookingGetBooking.Request,
      BookingGetBooking.Response
    >(BookingGetBooking.topic, {
      id: this.saga.bookingId,
    });
    if (!booking) {
      throw new NotFoundException(THIS_BOOKING_NOT_EXIST);
    }
    if (booking.price == 0) {
      this.saga.user.setBookingStatus(booking._id, PurchaseState.Purchased);
      return {
        paymentLink: null,
        user: this.saga.user,
      };
    }
    const { paymentLink } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, {
      bookingId: booking._id,
      userId: this.saga.user._id,
      sum: booking.price,
    });
    this.saga.setState(PurchaseState.WaitingForPayment, booking._id);
    return { paymentLink, user: this.saga.user };
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new NotFoundException(
      YOU_CANNOT_CHECK_A_PAYMENT_THAT_HAS_NOT_STARTED
    );
  }
  public cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Method not implemented.');
  }
}

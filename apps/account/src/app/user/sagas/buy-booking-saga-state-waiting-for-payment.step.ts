import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { BuyBookingSagaState } from './buy-booking.state';
import {
  PAYMENT_CANNOT_BE_CANCELLED_IN_PROGRESS,
  UNABLE_TO_CREATE_PAYMENT_LINK_DURING_PROCESS,
} from '../user.constants';
import { PaymentCheck, PaymentStatus } from '@./contracts';
import { PurchaseState } from '@./interfaces';

export class BuyBookingSagaStateWaitingForPayment extends BuyBookingSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new BadRequestException(UNABLE_TO_CREATE_PAYMENT_LINK_DURING_PROCESS);
  }
  public async checkPayment(): Promise<{
    user: UserEntity;
    status: PaymentStatus;
  }> {
    const { status } = await this.saga.rmqService.send<
      PaymentCheck.Request,
      PaymentCheck.Response
    >(PaymentCheck.topic, {
      userId: this.saga.user._id,
      bookingId: this.saga.bookingId,
    });
    if (status === PaymentStatus.Canceled) {
      this.saga.setState(PurchaseState.Canceled, this.saga.bookingId);
      return { user: this.saga.user, status: PaymentStatus.Canceled };
    }
    if (status !== PaymentStatus.Success) {
      return { user: this.saga.user, status: PaymentStatus.Success };
    }
    this.saga.setState(PurchaseState.Purchased, this.saga.bookingId);
    return { user: this.saga.user, status: PaymentStatus.Progress };
  }
  public cancel(): Promise<{ user: UserEntity }> {
    throw new ConflictException(PAYMENT_CANNOT_BE_CANCELLED_IN_PROGRESS);
  }
}

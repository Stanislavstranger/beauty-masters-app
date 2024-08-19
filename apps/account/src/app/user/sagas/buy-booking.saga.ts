import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from '@./interfaces';
import { BuyBookingSagaState } from './buy-booking.state';
import { BuyBookingSagaStateStarted } from './buy-booking-saga-state-started.step';
import { BuyBookingSagaStateWaitingForPayment } from './buy-booking-saga-state-waiting-for-payment.step';
import { BuyBookingSagaStatePurchased } from './buy-booking-saga-state-purchased.step';
import { BuyBookingSagaStateCanceled } from './buy-booking-saga-state-canceled.step';

export class BuyBookingSaga {
  private state: BuyBookingSagaState;

  constructor(
    public user: UserEntity,
    public bookingId: string,
    public rmqService: RMQService
  ) {}

  setState(state: PurchaseState, bookingId: string) {
    switch (state) {
      case PurchaseState.Started:
        this.state = new BuyBookingSagaStateStarted();
        break;
      case PurchaseState.WaitingForPayment:
        this.state = new BuyBookingSagaStateWaitingForPayment();
        break;
      case PurchaseState.Purchased:
        this.state = new BuyBookingSagaStatePurchased();
        break;
      case PurchaseState.Canceled:
        this.state = new BuyBookingSagaStateCanceled();
        break;
    }
    this.state.setContext(this);
    this.user.setBookingStatus(bookingId, state);
  }

  getState() {
    return this.state;
  }
}

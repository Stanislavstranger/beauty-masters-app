import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from '@./interfaces';
import { BuyBookingSagaState } from './buy-booking.state';

export class BuyBookingSaga {
  private state: BuyBookingSagaState;

  constructor(
    private user: UserEntity,
    private bookingId: string,
    private rmqService: RMQService
  ) {}

  setState(state: PurchaseState, bookingId: string) {
    switch (state) {
      case PurchaseState.Started:
        break;
      case PurchaseState.WaitingForPayment:
        break;
      case PurchaseState.Purchased:
        break;
      case PurchaseState.Canceled:
        break;
    }
    this.state.setContext(this);
    this.user.updateBookingStatus(bookingId, state);
  }

  getState() {
    return this.state;
  }
}

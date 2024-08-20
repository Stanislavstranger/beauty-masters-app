import { PaymentStatus } from '@./contracts';
import { UserEntity } from '../entities/user.entity';
import { BuyBookingSaga } from './buy-booking.saga';

export abstract class BuyBookingSagaState {
  public saga: BuyBookingSaga;

  public setContext(saga: BuyBookingSaga) {
    this.saga = saga;
  }

  public abstract pay(): Promise<{ paymentLink: string; user: UserEntity }>;
  public abstract checkPayment(): Promise<{
    user: UserEntity;
    status: PaymentStatus;
  }>;
  public abstract cancel(): Promise<{ user: UserEntity }>;
}

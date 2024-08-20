import { IsString } from 'class-validator';
import { PurchaseState } from '@./interfaces';

export namespace AccountChangedBooking {
  export const topic = 'account.changed-booking.event';

  export class Request {
    @IsString()
    userId!: string;

    @IsString()
    bookingId!: string;

    @IsString()
    state!: PurchaseState;
  }
}

import { PurchaseState } from '@./interfaces';
import { IsString } from 'class-validator';

export namespace AccountCheckPayment {
  export const topic = 'account.check-payment.query';

  export class Request {
    @IsString()
    bookingId!: string;

    userId!: string;
  }

  export class Response {
    status!: PurchaseState;
  }
}

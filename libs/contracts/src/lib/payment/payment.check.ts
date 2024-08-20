import { IsString } from 'class-validator';

export enum PaymentStatus {
  Canceled = 'canceled',
  Success = 'success',
  Progress = 'progress',
}

export namespace PaymentCheck {
  export const topic = 'payment.check.query';

  export class Request {
    @IsString()
    bookingId!: string;

    userId!: string | unknown;
  }

  export class Response {
    status!: PaymentStatus;
  }
}

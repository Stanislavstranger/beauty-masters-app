import { IsString } from 'class-validator';

export namespace AccountBuyBooking {
  export const topic = 'account.buy-course.command';

  export class Request {
    @IsString()
    userId!: string;

    @IsString()
    bookingId!: string;
  }

  export class Response {
    paymentLink!: string;
  }
}

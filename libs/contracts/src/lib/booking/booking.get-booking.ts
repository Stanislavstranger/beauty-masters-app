import { IsString } from 'class-validator';
import { IBooking } from '@./interfaces';

export namespace BookingGetBooking {
  export const topic = 'booking.get-booking.query';

  export class Request {
    @IsString()
    id!: string;
  }

  export class Response {
    booking!: IBooking | null;
  }
}

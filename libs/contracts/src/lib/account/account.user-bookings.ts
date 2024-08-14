import { IUserBookings } from '@./interfaces';
import { IsString } from 'class-validator';

export namespace AccountUserBookings {
  export const topic = 'account.user-bookings.query';

  export class Request {
    @IsString()
    id!: string;
  }

  export class Response {
    bookings?: IUserBookings[];
  }
}

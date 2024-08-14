export enum UserRole {
  Master = 'Master',
  Client = 'Client',
}

export enum PurchaseState {
  Started = 'Started',
  WaitingForPayment = 'WaitingForPayment',
  Purchased = 'Purchased',
  Canceled = 'Canceled',
}

export interface IUserBookings {
  _id?: string | unknown;
  bookingId: string;
  purchaseState: PurchaseState;
}

export interface IUser {
  _id?: string | unknown;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  bookings?: IUserBookings[];
}

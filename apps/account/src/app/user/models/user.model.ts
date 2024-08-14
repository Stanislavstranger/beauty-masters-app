import { Document, Types } from 'mongoose';
import { IUser, IUserBookings, PurchaseState, UserRole } from '@./interfaces';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserBookings extends Document implements IUserBookings {
  @Prop({ required: true })
  bookingId: string;

  @Prop({
    required: true,
    enum: PurchaseState,
    type: String,
  })
  purchaseState: PurchaseState;
}

export const UserBookingsSchema = SchemaFactory.createForClass(UserBookings);
@Schema()
export class User extends Document implements IUser {
  @Prop()
  displayName?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    enum: UserRole,
    type: String,
    default: UserRole.Client,
  })
  role: UserRole;

  @Prop({
    type: [UserBookingsSchema],
    _id: false,
  })
  bookings: Types.Array<UserBookings>;
}

export const UserSchema = SchemaFactory.createForClass(User);

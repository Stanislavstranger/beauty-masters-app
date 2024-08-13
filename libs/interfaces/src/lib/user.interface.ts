export enum UserRole {
  Master = 'Master',
  Client = 'Client',
}

export interface IUser {
  _id?: string | unknown;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

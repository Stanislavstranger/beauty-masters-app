import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export namespace AccountLogin {
  export const topic = 'account.login.command';

  export class Request {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
  }

  export class Response {
    access_token!: string;
  }
}

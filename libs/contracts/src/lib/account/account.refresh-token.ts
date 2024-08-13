import { IsString, IsNotEmpty } from 'class-validator';

export namespace AccountRefreshToken {
  export const topic = 'account.refresh-token.commands';

  export class Request {
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
  }

  export class Response {

  }
}
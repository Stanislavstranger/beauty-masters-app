import { AccountLogin } from './account.login';
import { IsString, IsNotEmpty } from 'class-validator';

export namespace AccountRegister {
  export const topic = 'account.register.command';

  export class Request extends AccountLogin.Request {
    @IsString()
    displayName?: string;
  }

  export class Response {
    @IsString()
    @IsNotEmpty()
    email!: string;
  }
}

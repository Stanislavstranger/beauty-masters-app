import { AccountLogin } from './account.login';
import { IsOptional, IsString } from 'class-validator';

export namespace AccountRegister {
  export const topic = 'account.register.command';

  export class Request extends AccountLogin.Request {
    @IsOptional()
    @IsString()
    displayName?: string;
  }

  export class Response {
    email!: string;
  }
}

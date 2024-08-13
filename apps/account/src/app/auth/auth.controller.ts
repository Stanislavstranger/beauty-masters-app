import {
  Body,
  Controller,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './is-public.decorator';
import { AccountLogin } from '@./contracts';
import { AccountRegister } from '@./contracts';
import { RMQRoute } from 'nestjs-rmq';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UsePipes(new ValidationPipe())
  @RMQRoute(AccountRegister.topic)
  async register(@Body() dto: AccountRegister.Request): Promise<AccountRegister.Response> {
    return this.authService.register(dto);
  }

  @Public()
  @UsePipes(new ValidationPipe())
  @RMQRoute(AccountLogin.topic)
  async login(@Body() dto: AccountLogin.Request): Promise<AccountLogin.Response> {
    const { id } = await this.authService.validateUser(dto);
    return this.authService.login(id);
  }
}

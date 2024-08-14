import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './is-public.decorator';
import { AccountLogin } from '@./contracts';
import { AccountRegister } from '@./contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @RMQValidate()
  @RMQRoute(AccountRegister.topic)
  async register(
    @Body() dto: AccountRegister.Request
  ): Promise<AccountRegister.Response> {
    return this.authService.register(dto);
  }

  @Public()
  @RMQValidate()
  @RMQRoute(AccountLogin.topic)
  async login(
    @Body() dto: AccountLogin.Request
  ): Promise<AccountLogin.Response> {
    const { id } = await this.authService.validateUser(dto);
    return this.authService.login(id);
  }
}

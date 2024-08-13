import { Body, Controller, Post } from '@nestjs/common';
import { AccountLogin } from '@./contracts';
import { AccountRegister } from '@./contracts';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('register')
  async register(@Body() dto: AccountRegister.Request) {}

  @Post('login')
  async login(@Body() dto: AccountLogin.Request) {}
}

import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ email: string }> {
    return this.authService.register(dto);
  }

  @Public()
  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    const { id } = await this.authService.validateUser(dto);
    return this.authService.login(id);
  }
}

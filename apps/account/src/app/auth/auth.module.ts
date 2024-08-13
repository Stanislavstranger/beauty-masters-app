import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from '../configs/jwt.config';

@Module({
  imports: [UserModule, JwtModule.registerAsync(getJWTConfig())],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

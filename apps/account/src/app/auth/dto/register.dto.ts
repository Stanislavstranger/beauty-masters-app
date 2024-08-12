import { LoginDto } from "./login.dto";
import { IsString } from 'class-validator';

export class RegisterDto extends LoginDto {
  @IsString()
  displayName?: string;
}
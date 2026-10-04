import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';
import type { 
  RegisterDto as RegisterInterface,
  LoginDto as LoginInterface,
  ResetPasswordDto as ResetPasswordInterface,
  TwoFactorVerifyDto as TwoFactorVerifyInterface,
  VerifyEmailDto as VerifyEmailInterface
} from '@ROTA-TCC/types';

export class RegisterDto implements RegisterInterface {
  @IsString()
  alias: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginDto implements LoginInterface {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class ResetPasswordDto implements ResetPasswordInterface {
  @IsString()
  token: string;

  @IsString()
  password: string;
}

export class TwoFactorVerifyDto implements TwoFactorVerifyInterface {
  @IsString()
  code: string;

  @IsString()
  partialToken: string;
}

export class VerifyEmailDto implements VerifyEmailInterface {
  @IsString()
  token: string;
}

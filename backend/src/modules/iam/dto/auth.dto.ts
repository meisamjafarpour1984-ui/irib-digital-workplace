import { IsMobilePhone, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(4)
  personnelCode!: string

  @IsMobilePhone('fa-IR')
  mobile!: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string
}

export class LoginDto {
  @IsString()
  @MinLength(4)
  personnelCode!: string

  @IsString()
  @MinLength(6)
  password!: string
}

export class VerifyOtpDto {
  @IsString()
  challengeId!: string

  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string
}

export class SetPinDto {
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  pin!: string
}

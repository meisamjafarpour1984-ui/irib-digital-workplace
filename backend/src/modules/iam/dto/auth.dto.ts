import {
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ description: 'Personnel code for registration', example: '12345' })
  @IsString()
  @MinLength(4, { message: 'Personnel code must be at least 4 characters long' })
  @MaxLength(20, { message: 'Personnel code must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Personnel code must contain only alphanumeric characters',
  })
  personnelCode: string

  @ApiProperty({ description: 'Mobile phone number for registration', example: '09123456789' })
  @IsMobilePhone('fa-IR')
  mobile: string

  @ApiPropertyOptional({ description: 'Full name of the user', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string
}

export class LoginDto {
  @ApiProperty({ description: 'Personnel code for login', example: '12345' })
  @IsString()
  @MinLength(4, { message: 'Personnel code must be at least 4 characters long' })
  @MaxLength(20, { message: 'Personnel code must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Personnel code must contain only alphanumeric characters',
  })
  personnelCode: string

  @ApiProperty({ description: 'Password for login', example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Challenge ID for OTP verification', example: 'abc123xyz' })
  @IsString()
  challengeId: string

  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP code must contain only 6 digits' })
  code: string
}

export class SetPinDto {
  @ApiProperty({ description: '6-digit PIN code', example: '123456' })
  @Length(6, 6, { message: 'PIN must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'PIN must contain only 6 digits' })
  pin: string
}

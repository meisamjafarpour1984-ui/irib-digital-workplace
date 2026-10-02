import { IsString, IsNotEmpty, IsPhoneNumber, Length } from 'class-validator'

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('IR')
  mobile: string

  @IsString()
  @IsNotEmpty()
  purpose: 'registration' | 'login' | 'password_reset' | 'mobile_change'
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string
}

export class UpdateMobileDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('IR')
  mobile: string
}

export class OtpChallengeResponse {
  challengeId: string
  expiresIn: number
  devOtp?: string
}

export class VerificationResponse {
  success: boolean
  phoneVerified: boolean
  phoneVerifiedAt?: Date
}

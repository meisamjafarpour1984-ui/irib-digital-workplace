import {
  IsEmail,
  IsMobilePhone,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: 'Personnel code for the user', example: '12345' })
  @IsString()
  @MinLength(4, { message: 'Personnel code must be at least 4 characters long' })
  @MaxLength(20, { message: 'Personnel code must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Personnel code must contain only alphanumeric characters',
  })
  personnelCode: string

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string

  @ApiPropertyOptional({ description: 'Mobile phone number', example: '09123456789' })
  @IsOptional()
  @IsMobilePhone('fa-IR')
  mobile?: string

  @ApiPropertyOptional({ description: 'Persian name of the user', example: 'جان دو' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Persian name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Persian name must not exceed 100 characters' })
  nameFa?: string

  @ApiPropertyOptional({ description: 'National code', example: '1234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'National code must be exactly 10 digits' })
  nationalCode?: string

  @ApiPropertyOptional({
    description: 'Array of department IDs',
    example: ['dept-1', 'dept-2'],
    type: [String],
  })
  @IsOptional()
  departmentIds?: string[]

  @ApiPropertyOptional({ description: 'Initial status of the user', example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Status must not exceed 50 characters' })
  initialStatus?: string
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Full name of the user', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string

  @ApiPropertyOptional({ description: 'Mobile phone number', example: '09123456789' })
  @IsOptional()
  @IsMobilePhone('fa-IR')
  mobile?: string

  @ApiPropertyOptional({ description: 'Persian name of the user', example: 'جان دو' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Persian name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Persian name must not exceed 100 characters' })
  nameFa?: string

  @ApiPropertyOptional({ description: 'National code', example: '1234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'National code must be exactly 10 digits' })
  nationalCode?: string

  @ApiPropertyOptional({
    description: 'Array of department IDs',
    example: ['dept-1', 'dept-2'],
    type: [String],
  })
  @IsOptional()
  departmentIds?: string[]
}

/**
 * IRIB Digital Workplace Platform - Theme DTOs
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsBoolean, IsObject, IsDate } from 'class-validator'

export class CreateThemeTokenDto {
  @ApiProperty()
  @IsString()
  name!: string

  @ApiProperty()
  @IsString()
  category!: string

  @ApiProperty()
  @IsObject()
  tokens!: Record<string, string>

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  scheduledAt?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  expiresAt?: Date
}

export class UpdateThemeTokenDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  tokens?: Record<string, string>

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  scheduledAt?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  expiresAt?: Date
}

export class ImportThemeDto {
  @ApiProperty()
  @IsString()
  category!: string

  @ApiProperty({ type: [Object] })
  tokens!: Array<{
    name: string
    tokens: Record<string, string>
  }>
}

export class ThemePreviewDto {
  @ApiProperty()
  @IsObject()
  tokens!: Record<string, string>
}

/**
 * IRIB Digital Workplace Platform - Storage DTOs
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsObject } from 'class-validator'

export class UploadFileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

export class StorageConfigDto {
  @ApiProperty()
  @IsString()
  provider!: 'local' | 's3'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endpoint?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bucket?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessKey?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secretKey?: string
}

export class UpdateStorageConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  provider?: 'local' | 's3'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endpoint?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bucket?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessKey?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secretKey?: string
}

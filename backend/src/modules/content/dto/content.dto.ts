import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { ContentStatus, ContentType } from '@prisma/client'

export class ContentListQueryDto {
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10
}

export class CreateContentDto {
  @IsEnum(ContentType)
  contentType!: ContentType

  @IsString()
  @MinLength(3)
  @MaxLength(250)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string

  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  body?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tagNames?: string[]

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  scopeIds?: string[]
}

export class UpdateContentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion!: number

  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(250)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string

  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  body?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tagNames?: string[]

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  scopeIds?: string[]
}

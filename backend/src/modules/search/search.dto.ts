import { ContentType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class SearchQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  q!: string

  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20
}

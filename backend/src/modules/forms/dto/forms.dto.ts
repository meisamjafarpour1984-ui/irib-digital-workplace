import { FormType, SubmissionStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export enum FormFieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  TOGGLE = 'toggle',
}

export class FormFieldDto {
  @IsString() @MinLength(1) @MaxLength(80) id!: string
  @IsEnum(FormFieldType) type!: FormFieldType
  @IsString() @MinLength(1) @MaxLength(200) label!: string
  @IsBoolean() required!: boolean
  @IsOptional() @IsString() @MaxLength(300) placeholder?: string
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  options?: string[]
}

export class CreateFormDto {
  @IsString() @MinLength(3) @MaxLength(200) title!: string
  @IsOptional() @IsString() @MaxLength(1000) description?: string
  @IsOptional() @IsEnum(FormType) formType: FormType = FormType.DATA_COLLECTION
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields!: FormFieldDto[]
}

export class SubmitFormDto {
  @IsObject() data!: Record<string, unknown>
}

export class SubmissionListQueryDto {
  @IsOptional() @IsEnum(SubmissionStatus) status?: SubmissionStatus
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 50
}

import { ParticipantRole, Priority } from '@prisma/client'
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateConversationDto {
  @IsString() @MinLength(3) @MaxLength(200) subject!: string
  @IsOptional() @IsString() @MaxLength(80) entityType = 'Custom'
  @IsOptional() @IsString() @MaxLength(120) entityId = 'custom'
  @IsOptional() @IsEnum(Priority) priority: Priority = Priority.NORMAL
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsUUID('4', { each: true }) participantIds?: string[]
}

export class SendMessageDto {
  @IsString() @MinLength(1) @MaxLength(10_000) text!: string
}

export class ConversationFilterDto {
  @IsOptional() @IsEnum(ParticipantRole) role?: ParticipantRole
}

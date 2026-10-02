/**
 * IRIB Digital Workplace Platform - Permissions DTOs
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { IsString, IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator'

export class GrantPermissionDto {
  @IsString()
  userId: string

  @IsString()
  roleId: string

  @IsString()
  permissionId: string

  @IsOptional()
  @IsString()
  scopeType?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopeIds?: string[]
}

export class RevokePermissionDto {
  @IsString()
  userId: string

  @IsString()
  roleId: string

  @IsString()
  permissionId: string
}

export class AssignRoleDto {
  @IsString()
  userId: string

  @IsString()
  roleId: string

  @IsOptional()
  @IsString()
  scopeType?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopeIds?: string[]

  @IsOptional()
  @IsString()
  assignedBy?: string
}

export class CreatePermissionDto {
  @IsString()
  entity: string

  @IsString()
  action: string

  @IsOptional()
  @IsString()
  description?: string
}

export class CreateRoleDto {
  @IsString()
  code: string

  @ValidateNested()
  name: { fa: string; en: string }

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean
}

export class CheckPermissionDto {
  @IsString()
  userId: string

  @IsString()
  entity: string

  @IsString()
  action: string

  @IsOptional()
  @IsString()
  departmentId?: string

  @IsOptional()
  @IsString()
  unitId?: string

  @IsOptional()
  @IsString()
  ownerId?: string
}

export class PermissionResponseDto {
  hasPermission: boolean
  reason?: string
  permissions: Array<{
    permissionId: string
    entity: string
    action: string
    scopeType: string
    scopeIds: string[]
    source: 'role' | 'explicit'
  }>
}

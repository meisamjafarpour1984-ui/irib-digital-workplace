import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PermissionsService } from './permissions.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Access Control')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('check')
  @ApiOperation({ summary: 'Check if user has permission' })
  async checkPermission(
    @Request() req: any,
    @Body() body: { entity: string; action: string; scopeIds?: string[] }
  ) {
    const hasPermission = await this.permissionsService.checkPermission(
      req.user.sub,
      body.entity,
      body.action,
      body.scopeIds
    )
    return { hasPermission }
  }

  @Get('effective')
  @ApiOperation({ summary: 'Get effective permissions for current user' })
  async getEffectivePermissions(@Request() req: any) {
    return this.permissionsService.getEffectivePermissions(req.user.sub)
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get full permission matrix (Admin only)' })
  async getPermissionMatrix() {
    return this.permissionsService.getPermissionMatrix()
  }
}

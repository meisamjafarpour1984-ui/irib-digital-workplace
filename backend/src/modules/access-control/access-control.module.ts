import { Module } from '@nestjs/common'
import { PermissionsController } from './permissions.controller'
import { PermissionsService } from './permissions.service'
import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'

@Module({
  controllers: [PermissionsController, RolesController],
  providers: [PermissionsService, RolesService],
  exports: [PermissionsService, RolesService],
})
export class AccessControlModule {}

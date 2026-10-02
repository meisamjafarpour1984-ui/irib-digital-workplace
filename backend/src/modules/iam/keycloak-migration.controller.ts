import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { KeycloakMigrationService } from './keycloak-migration.service'

@ApiTags('Keycloak Migration')
@Controller('keycloak-migration')
export class KeycloakMigrationController {
  constructor(private readonly migrationService: KeycloakMigrationService) {}

  @Post('migrate')
  @ApiOperation({ summary: 'Migrate all users from database to Keycloak' })
  @ApiResponse({ status: 200, description: 'Migration completed' })
  async migrateUsers(@Body() body: { dryRun?: boolean; batchSize?: number }) {
    return this.migrationService.migrateUsersToKeycloak(body)
  }

  @Post('sync/:userId')
  @ApiOperation({ summary: 'Sync single user to Keycloak' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  async syncUser(@Param('userId') userId: string) {
    return this.migrationService.syncUserToKeycloak(userId)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get migration statistics' })
  @ApiResponse({ status: 200, description: 'Migration statistics' })
  async getStats() {
    return this.migrationService.getMigrationStats()
  }
}

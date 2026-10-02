import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { KeycloakMigrationService } from './keycloak-migration.service'
import { KeycloakMigrationController } from './keycloak-migration.controller'

@Module({
  controllers: [KeycloakMigrationController],
  providers: [KeycloakMigrationService, ConfigService],
  exports: [KeycloakMigrationService],
})
export class KeycloakMigrationModule {}

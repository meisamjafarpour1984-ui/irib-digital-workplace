import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { UserManagementController } from './user-management.controller'
import { UserManagementService } from './user-management.service'
import { MobileVerificationModule } from '../mobile-verification/mobile-verification.module'
import { KeycloakMigrationModule } from './keycloak-migration.module'
import { KeycloakModule } from './keycloak.module'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MobileVerificationModule,
    KeycloakMigrationModule,
    KeycloakModule,
  ],
  controllers: [AuthController, UserManagementController],
  providers: [AuthService, JwtStrategy, UserManagementService],
  exports: [AuthService],
})
export class IamModule {}

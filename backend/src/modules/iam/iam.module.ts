import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { UserManagementController } from './user-management.controller'
import { UserManagementService } from './user-management.service'

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController, UserManagementController],
  providers: [AuthService, JwtStrategy, UserManagementService],
  exports: [AuthService],
})
export class IamModule {}

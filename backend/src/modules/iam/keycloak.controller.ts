/**
 * IRIB Digital Workplace Platform - Keycloak Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { KeycloakService } from './keycloak.service'

@ApiTags('Keycloak')
@Controller('keycloak')
export class KeycloakController {
  constructor(private readonly keycloakService: KeycloakService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Keycloak health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved' })
  async getHealth() {
    return this.keycloakService.getHealthStatus()
  }

  @Get('test')
  @ApiOperation({ summary: 'Test Keycloak connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  async testConnection() {
    return this.keycloakService.testConnection()
  }

  @Get('available')
  @ApiOperation({ summary: 'Check if Keycloak is available' })
  @ApiResponse({ status: 200, description: 'Availability status' })
  async isAvailable() {
    const available = await this.keycloakService.isAvailable()
    return { available }
  }
}

/**
 * IRIB Digital Workplace Platform - Keycloak Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type KcAdminClient from '@keycloak/keycloak-admin-client' with {
  'resolution-mode': 'import',
}

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name)
  private readonly keycloakUrl: string
  private readonly keycloakRealm: string
  private readonly keycloakClientId: string
  private readonly keycloakClientSecret: string
  private keycloakAdmin: KcAdminClient | null = null
  private adminToken: string | null = null

  constructor(private readonly config: ConfigService) {
    this.keycloakUrl = this.config.get<string>('KEYCLOAK_URL', 'http://localhost:8080')
    this.keycloakRealm = this.config.get<string>('KEYCLOAK_REALM', 'irib-dwp')
    this.keycloakClientId = this.config.get<string>('KEYCLOAK_CLIENT_ID', 'irib-dwp-web')
    this.keycloakClientSecret = this.config.get<string>(
      'KEYCLOAK_CLIENT_SECRET',
      'irib-dwp-client-secret'
    )
  }

  /**
   * Initialize Keycloak admin client
   */
  async onModuleInit() {
    try {
      const { default: KeycloakAdminClient } = await import('@keycloak/keycloak-admin-client')
      this.keycloakAdmin = new KeycloakAdminClient({
        baseUrl: this.keycloakUrl,
        realmName: 'master',
      })

      await this.keycloakAdmin.auth({
        username: this.config.get<string>('KEYCLOAK_ADMIN_USERNAME', 'admin'),
        password: this.config.get<string>('KEYCLOAK_ADMIN_PASSWORD', 'admin'),
        clientId: 'admin-cli',
        grantType: 'password',
      })

      this.logger.log('Keycloak admin client initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize Keycloak admin client:', error)
      // Don't throw error, allow application to start without Keycloak
    }
  }

  /**
   * Validate Keycloak JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      if (!this.keycloakAdmin) {
        throw new Error('Keycloak admin client not initialized')
      }

      // Decode token without verification (for development)
      // In production, verify with Keycloak public key
      const payload = this.decodeJwt(token)

      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new UnauthorizedException('Token expired')
      }

      // Check if token is for correct realm and client
      if (payload.iss !== `${this.keycloakUrl}/realms/${this.keycloakRealm}`) {
        throw new UnauthorizedException('Invalid token issuer')
      }

      if (payload.aud !== this.keycloakClientId) {
        throw new UnauthorizedException('Invalid token audience')
      }

      return payload
    } catch (error) {
      this.logger.error('Error validating token:', error)
      throw new UnauthorizedException('Invalid token')
    }
  }

  /**
   * Get user info from Keycloak token
   */
  async getUserInfo(token: string): Promise<any> {
    try {
      const payload = await this.validateToken(token)

      return {
        id: payload.sub,
        username: payload.preferred_username,
        email: payload.email,
        name: payload.name,
        givenName: payload.given_name,
        familyName: payload.family_name,
        roles: payload.realm_access?.roles || [],
        attributes: payload.attributes || {},
      }
    } catch (error) {
      this.logger.error('Error getting user info:', error)
      throw error
    }
  }

  /**
   * Refresh Keycloak token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await fetch(
        `${this.keycloakUrl}/realms/${this.keycloakRealm}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: this.keycloakClientId,
            client_secret: this.keycloakClientSecret,
            refresh_token: refreshToken,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      }
    } catch (error) {
      this.logger.error('Error refreshing token:', error)
      throw error
    }
  }

  /**
   * Get user by Keycloak ID
   */
  async getUserById(keycloakId: string): Promise<any> {
    try {
      if (!this.keycloakAdmin) {
        throw new Error('Keycloak admin client not initialized')
      }

      const users = await this.keycloakAdmin.users.find({
        realm: this.keycloakRealm,
        id: keycloakId,
      })

      if (!users || users.length === 0) {
        throw new Error('User not found')
      }

      return users[0]
    } catch (error) {
      this.logger.error(`Error getting user ${keycloakId}:`, error)
      throw error
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<any> {
    try {
      if (!this.keycloakAdmin) {
        throw new Error('Keycloak admin client not initialized')
      }

      const users = await this.keycloakAdmin.users.find({
        realm: this.keycloakRealm,
        username: username,
      })

      if (!users || users.length === 0) {
        throw new Error('User not found')
      }

      return users[0]
    } catch (error) {
      this.logger.error(`Error getting user ${username}:`, error)
      throw error
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(keycloakId: string): Promise<string[]> {
    try {
      if (!this.keycloakAdmin) {
        throw new Error('Keycloak admin client not initialized')
      }

      const roles = await this.keycloakAdmin.users.listRealmRoleMappings({
        realm: this.keycloakRealm,
        id: keycloakId,
      })

      return roles.map((role) => role.name!)
    } catch (error) {
      this.logger.error(`Error getting roles for user ${keycloakId}:`, error)
      return []
    }
  }

  /**
   * Decode JWT token (without verification - for development)
   */
  private decodeJwt(token: string): any {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  }

  /**
   * Check if Keycloak is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.keycloakUrl}/health/ready`)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get Keycloak health status
   */
  async getHealthStatus(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(`${this.keycloakUrl}/health/ready`)
      if (response.ok) {
        return { available: true, message: 'Keycloak is healthy' }
      }
      return { available: false, message: `Keycloak returned status ${response.status}` }
    } catch (error) {
      return { available: false, message: `Keycloak connection failed: ${error.message}` }
    }
  }

  /**
   * Test Keycloak connection
   */
  async testConnection(): Promise<{ success: boolean; details: any }> {
    const details: any = {
      url: this.keycloakUrl,
      realm: this.keycloakRealm,
      clientId: this.keycloakClientId,
      adminInitialized: this.keycloakAdmin !== null,
      hasAdminToken: this.adminToken !== null,
    }

    try {
      const health = await this.getHealthStatus()
      details.health = health

      if (this.keycloakAdmin) {
        // Test admin client by getting realm info
        const realms = await this.keycloakAdmin.realms.find()
        details.realmsCount = realms.length
      }

      return { success: health.available, details }
    } catch (error) {
      details.error = error.message
      return { success: false, details }
    }
  }
}

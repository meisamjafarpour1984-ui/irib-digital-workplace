/**
 * IRIB Digital Workplace Platform - Keycloak Migration Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'

// Keycloak Admin Client types (simplified)
interface KeycloakUser {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  enabled: boolean
  attributes?: Record<string, string[]>
}

@Injectable()
export class KeycloakMigrationService {
  private readonly logger = new Logger(KeycloakMigrationService.name)
  private readonly keycloakUrl: string
  private readonly keycloakRealm: string
  private readonly keycloakAdminUsername: string
  private readonly keycloakAdminPassword: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    this.keycloakUrl = this.config.get<string>('KEYCLOAK_URL', 'http://localhost:8080')
    this.keycloakRealm = this.config.get<string>('KEYCLOAK_REALM', 'irib-dwp')
    this.keycloakAdminUsername = this.config.get<string>('KEYCLOAK_ADMIN_USERNAME', 'admin')
    this.keycloakAdminPassword = this.config.get<string>('KEYCLOAK_ADMIN_PASSWORD', 'admin')
  }

  /**
   * Get admin access token from Keycloak
   */
  private async getAdminToken(): Promise<string> {
    try {
      const response = await fetch(
        `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: 'admin-cli',
            username: this.keycloakAdminUsername,
            password: this.keycloakAdminPassword,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to get admin token: ${response.statusText}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      this.logger.error('Error getting admin token:', error)
      throw error
    }
  }

  /**
   * Create user in Keycloak
   */
  private async createKeycloakUser(user: any, adminToken: string): Promise<KeycloakUser> {
    try {
      const keycloakUser = {
        username: user.personnelCode,
        email: user.email || undefined,
        firstName: user.name,
        lastName: user.nameFa || '',
        enabled: user.status === 'ACTIVE',
        attributes: {
          personnelCode: [user.personnelCode],
          mobile: user.mobile ? [user.mobile] : [],
          nationalCode: user.nationalCode ? [user.nationalCode] : [],
        },
        credentials: user.passwordHash
          ? [
              {
                type: 'password',
                value: await this.getPasswordForMigration(user.passwordHash),
                temporary: false,
              },
            ]
          : undefined,
      }

      const response = await fetch(`${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(keycloakUser),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create user: ${error}`)
      }

      // Get the created user by username
      const usersResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users?username=${user.personnelCode}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      )

      if (!usersResponse.ok) {
        throw new Error('Failed to retrieve created user')
      }

      const users = await usersResponse.json()
      return users[0]
    } catch (error) {
      this.logger.error(`Error creating Keycloak user for ${user.personnelCode}:`, error)
      throw error
    }
  }

  /**
   * Get password for migration (requires user to reset or use temporary password)
   * For now, we'll use a default temporary password
   */
  private async getPasswordForMigration(_passwordHash: string): Promise<string> {
    // In production, you might want to:
    // 1. Use a default temporary password and force users to reset
    // 2. Migrate password hashes if they're compatible
    // 3. Send password reset emails

    // For now, use a default temporary password
    return 'TempPassword123!'
  }

  /**
   * Assign role to user in Keycloak
   */
  private async assignKeycloakRole(
    keycloakUserId: string,
    roleName: string,
    adminToken: string
  ): Promise<void> {
    try {
      // Get role by name
      const rolesResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/roles/${roleName}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      )

      if (!rolesResponse.ok) {
        this.logger.warn(`Role ${roleName} not found in Keycloak, skipping assignment`)
        return
      }

      const role = await rolesResponse.json()

      // Assign role to user
      const assignResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${keycloakUserId}/role-mappings/realm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify([role]),
        }
      )

      if (!assignResponse.ok) {
        throw new Error(`Failed to assign role ${roleName}`)
      }

      this.logger.log(`Assigned role ${roleName} to user ${keycloakUserId}`)
    } catch (error) {
      this.logger.error(`Error assigning role ${roleName}:`, error)
      // Don't throw error, continue with migration
    }
  }

  /**
   * Migrate all users from database to Keycloak
   */
  async migrateUsersToKeycloak(options?: { dryRun?: boolean; batchSize?: number }) {
    const dryRun = options?.dryRun ?? false
    const batchSize = options?.batchSize ?? 10

    this.logger.log(`Starting user migration (dry run: ${dryRun})`)

    try {
      const adminToken = await this.getAdminToken()

      // Get all users from database
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      this.logger.log(`Found ${users.length} users to migrate`)

      let successCount = 0
      let failureCount = 0
      const errors: Array<{ user: string; error: string }> = []

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        this.logger.log(`Processing batch ${Math.floor(i / batchSize) + 1}`)

        for (const user of batch) {
          try {
            if (dryRun) {
              this.logger.log(`[DRY RUN] Would migrate user: ${user.personnelCode}`)
              successCount++
              continue
            }

            // Check if user already migrated
            if (user.keycloakId) {
              this.logger.log(
                `User ${user.personnelCode} already migrated (Keycloak ID: ${user.keycloakId})`
              )
              successCount++
              continue
            }

            // Create user in Keycloak
            const keycloakUser = await this.createKeycloakUser(user, adminToken)

            // Assign roles
            for (const userRole of user.roles) {
              const roleName =
                typeof userRole.role.name === 'string'
                  ? userRole.role.name
                  : String(userRole.role.name)
              await this.assignKeycloakRole(keycloakUser.id, roleName, adminToken)
            }

            // Update database with Keycloak ID
            await this.prisma.user.update({
              where: { id: user.id },
              data: {
                keycloakId: keycloakUser.id,
                keycloakSyncedAt: new Date(),
              },
            })

            this.logger.log(`Successfully migrated user: ${user.personnelCode}`)
            successCount++
          } catch (error) {
            failureCount++
            errors.push({
              user: user.personnelCode,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            this.logger.error(`Failed to migrate user ${user.personnelCode}:`, error)
          }
        }
      }

      this.logger.log(`Migration completed: ${successCount} success, ${failureCount} failures`)

      if (errors.length > 0) {
        this.logger.error('Migration errors:', errors)
      }

      return {
        total: users.length,
        success: successCount,
        failure: failureCount,
        errors,
      }
    } catch (error) {
      this.logger.error('Migration failed:', error)
      throw error
    }
  }

  /**
   * Sync single user to Keycloak
   */
  async syncUserToKeycloak(userId: string) {
    this.logger.log(`Syncing user ${userId} to Keycloak`)

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      if (!user) {
        throw new BadRequestException('User not found')
      }

      if (user.keycloakId) {
        this.logger.log(`User ${userId} already synced (Keycloak ID: ${user.keycloakId})`)
        return { success: true, message: 'User already synced' }
      }

      const adminToken = await this.getAdminToken()
      const keycloakUser = await this.createKeycloakUser(user, adminToken)

      // Assign roles
      for (const userRole of user.roles) {
        const roleName =
          typeof userRole.role.name === 'string' ? userRole.role.name : String(userRole.role.name)
        await this.assignKeycloakRole(keycloakUser.id, roleName, adminToken)
      }

      // Update database
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          keycloakId: keycloakUser.id,
          keycloakSyncedAt: new Date(),
        },
      })

      this.logger.log(`Successfully synced user ${userId}`)
      return { success: true, keycloakId: keycloakUser.id }
    } catch (error) {
      this.logger.error(`Failed to sync user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats() {
    const [totalUsers, migratedUsers, notMigratedUsers] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { deletedAt: null, keycloakId: { not: null } },
      }),
      this.prisma.user.count({
        where: { deletedAt: null, keycloakId: null },
      }),
    ])

    return {
      total: totalUsers,
      migrated: migratedUsers,
      notMigrated: notMigratedUsers,
      migrationRate: totalUsers > 0 ? (migratedUsers / totalUsers) * 100 : 0,
    }
  }
}

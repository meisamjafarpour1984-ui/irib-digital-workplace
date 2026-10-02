/**
 * IRIB Digital Workplace Platform - Theme Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getAllTokens() {
    try {
      return this.prisma.themeToken.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })
    } catch (error) {
      this.logger.error('Error getting all theme tokens:', error)
      throw new BadRequestException('Failed to get theme tokens')
    }
  }

  async getTokensByCategory(category: string) {
    try {
      return this.prisma.themeToken.findMany({
        where: { category, isActive: true },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.logger.error(`Error getting tokens for category ${category}:`, error)
      throw new BadRequestException('Failed to get theme tokens')
    }
  }

  async getToken(id: string) {
    try {
      const token = await this.prisma.themeToken.findUnique({
        where: { id },
      })
      if (!token) throw new NotFoundException('Theme token not found')
      return token
    } catch (error) {
      this.logger.error(`Error getting token ${id}:`, error)
      throw error
    }
  }

  async createToken(data: {
    name: string
    category: string
    tokens: any
    isDefault?: boolean
    scheduledAt?: Date
    expiresAt?: Date
    createdBy?: string
  }) {
    try {
      // Check if token name already exists
      const existing = await this.prisma.themeToken.findUnique({
        where: { name: data.name },
      })
      if (existing) {
        throw new BadRequestException('Theme token with this name already exists')
      }

      return this.prisma.themeToken.create({
        data: {
          name: data.name,
          category: data.category,
          tokens: data.tokens,
          isDefault: data.isDefault || false,
          isActive: true,
          scheduledAt: data.scheduledAt,
          expiresAt: data.expiresAt,
          createdBy: data.createdBy,
        },
      })
    } catch (error) {
      this.logger.error('Error creating theme token:', error)
      throw new BadRequestException('Failed to create theme token')
    }
  }

  async updateToken(
    id: string,
    data: {
      name?: string
      category?: string
      tokens?: any
      isDefault?: boolean
      isActive?: boolean
      scheduledAt?: Date
      expiresAt?: Date
    }
  ) {
    try {
      await this.getToken(id)

      // If setting as default, unset other defaults in same category
      if (data.isDefault && data.category) {
        await this.prisma.themeToken.updateMany({
          where: {
            category: data.category,
            id: { not: id },
          },
          data: { isDefault: false },
        })
      }

      return this.prisma.themeToken.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.logger.error(`Error updating token ${id}:`, error)
      throw new BadRequestException('Failed to update theme token')
    }
  }

  async deleteToken(id: string) {
    try {
      const token = await this.getToken(id)

      if (token.isDefault) {
        throw new BadRequestException('Cannot delete default theme token')
      }

      return this.prisma.themeToken.update({
        where: { id },
        data: { isActive: false },
      })
    } catch (error) {
      this.logger.error(`Error deleting token ${id}:`, error)
      throw new BadRequestException('Failed to delete theme token')
    }
  }

  async getActiveThemes() {
    try {
      return this.prisma.themeToken.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })
    } catch (error) {
      this.logger.error('Error getting active themes:', error)
      throw new BadRequestException('Failed to get active themes')
    }
  }

  async getScheduledThemes() {
    try {
      const now = new Date()
      return this.prisma.themeToken.findMany({
        where: {
          isActive: true,
          scheduledAt: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
        orderBy: { scheduledAt: 'asc' },
      })
    } catch (error) {
      this.logger.error('Error getting scheduled themes:', error)
      throw new BadRequestException('Failed to get scheduled themes')
    }
  }

  async activateScheduledTheme(id: string) {
    try {
      const token = await this.getToken(id)

      // Deactivate other themes in same category
      await this.prisma.themeToken.updateMany({
        where: {
          category: token.category,
          id: { not: id },
        },
        data: { isActive: false },
      })

      // Activate this theme
      return this.prisma.themeToken.update({
        where: { id },
        data: { isActive: true },
      })
    } catch (error) {
      this.logger.error(`Error activating theme ${id}:`, error)
      throw new BadRequestException('Failed to activate theme')
    }
  }

  async getThemePreview(tokens: Record<string, string>) {
    try {
      // Just return the tokens for preview - validation happens on frontend
      return {
        tokens,
        preview: true,
      }
    } catch (error) {
      this.logger.error('Error getting theme preview:', error)
      throw new BadRequestException('Failed to get theme preview')
    }
  }

  async exportTheme(category?: string) {
    try {
      const where: any = { isActive: true }
      if (category) where.category = category

      const tokens = await this.prisma.themeToken.findMany({
        where,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })

      return {
        category,
        tokens,
        exportedAt: new Date(),
      }
    } catch (error) {
      this.logger.error('Error exporting theme:', error)
      throw new BadRequestException('Failed to export theme')
    }
  }

  async importTheme(data: { category: string; tokens: any[] }) {
    try {
      const results = []

      for (const tokenData of data.tokens) {
        try {
          const existing = await this.prisma.themeToken.findUnique({
            where: { name: tokenData.name },
          })

          if (existing) {
            // Update existing token
            const updated = await this.prisma.themeToken.update({
              where: { id: existing.id },
              data: {
                tokens: tokenData.tokens,
                isActive: true,
              },
            })
            results.push({ name: tokenData.name, action: 'updated', id: updated.id })
          } else {
            // Create new token
            const created = await this.prisma.themeToken.create({
              data: {
                name: tokenData.name,
                category: data.category,
                tokens: tokenData.tokens,
                isActive: true,
              },
            })
            results.push({ name: tokenData.name, action: 'created', id: created.id })
          }
        } catch (error) {
          this.logger.error(`Error importing token ${tokenData.name}:`, error)
          results.push({
            name: tokenData.name,
            action: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return {
        total: data.tokens.length,
        successful: results.filter((r) => r.action !== 'failed').length,
        failed: results.filter((r) => r.action === 'failed').length,
        results,
      }
    } catch (error) {
      this.logger.error('Error importing theme:', error)
      throw new BadRequestException('Failed to import theme')
    }
  }

  async getThemeStats() {
    try {
      const [totalTokens, activeTokens, tokensByCategory] = await Promise.all([
        this.prisma.themeToken.count(),
        this.prisma.themeToken.count({ where: { isActive: true } }),
        this.prisma.themeToken.groupBy({
          by: ['category'],
          _count: true,
        }),
      ])

      return {
        totalTokens,
        activeTokens,
        tokensByCategory: tokensByCategory.map((item) => ({
          category: item.category,
          count: item._count,
        })),
      }
    } catch (error) {
      this.logger.error('Error getting theme stats:', error)
      throw new BadRequestException('Failed to get theme stats')
    }
  }
}

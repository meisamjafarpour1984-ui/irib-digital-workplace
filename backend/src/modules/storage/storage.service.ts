/**
 * IRIB Digital Workplace Platform - Storage Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private readonly uploadDir: string
  private readonly storageProvider: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR') || './uploads'
    this.storageProvider = this.config.get<string>('STORAGE_PROVIDER') || 'local'
    this.ensureUploadDir()
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true })
    } catch (error) {
      this.logger.error('Error creating upload directory:', error)
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadedById?: string,
    metadata?: Record<string, any>
  ) {
    try {
      // Calculate file hash for deduplication
      const fileBuffer = await fs.readFile(file.path)
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
      const size = fileBuffer.length

      // Check if file with same hash already exists
      const existing = await this.prisma.mediaAsset.findUnique({
        where: { hash },
      })

      if (existing) {
        // File already exists, return existing asset
        await fs.unlink(file.path) // Clean up temp file
        return {
          asset: existing,
          isNew: false,
        }
      }

      // Generate storage key
      const storageKey = this.generateStorageKey(file.originalname, hash)
      const mimeType = file.mimetype

      // Get dimensions for images
      let width: number | undefined
      let height: number | undefined
      if (mimeType.startsWith('image/')) {
        const dimensions = await this.getImageDimensions(file.path)
        width = dimensions.width
        height = dimensions.height
      }

      // Save file based on storage provider
      await this.saveFile(file.path, storageKey)

      // Create media asset record
      const asset = await this.prisma.mediaAsset.create({
        data: {
          filename: file.originalname,
          originalName: file.originalname,
          mimeType,
          size: BigInt(size),
          hash,
          storageKey,
          storageProvider: this.storageProvider,
          width,
          height,
          metadata: metadata || {},
          uploadedById,
        },
      })

      return {
        asset,
        isNew: true,
      }
    } catch (error) {
      this.logger.error('Error uploading file:', error)
      throw new BadRequestException('Failed to upload file')
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadedById?: string,
    metadata?: Record<string, any>
  ) {
    const results = []
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, uploadedById, metadata)
        results.push(result)
      } catch (error) {
        this.logger.error(`Error uploading file ${file.originalname}:`, error)
        results.push({
          error: file.originalname,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
    return results
  }

  async getAsset(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id },
    })
    if (!asset) throw new NotFoundException('Asset not found')
    return asset
  }

  async getAssetByHash(hash: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { hash },
    })
  }

  async getAssetUrl(id: string) {
    const asset = await this.getAsset(id)
    return this.getFileUrl(asset.storageKey)
  }

  async downloadFile(id: string) {
    const asset = await this.getAsset(id)
    const filePath = path.join(this.uploadDir, asset.storageKey)

    try {
      const fileBuffer = await fs.readFile(filePath)
      return {
        buffer: fileBuffer,
        filename: asset.originalName,
        mimeType: asset.mimeType,
      }
    } catch (error) {
      this.logger.error(`Error reading file ${id}:`, error)
      throw new BadRequestException('Failed to read file')
    }
  }

  async deleteAsset(id: string) {
    const asset = await this.getAsset(id)

    try {
      // Delete physical file
      const filePath = path.join(this.uploadDir, asset.storageKey)
      await fs.unlink(filePath).catch(() => {
        this.logger.warn(`File not found for deletion: ${filePath}`)
      })

      // Delete database record
      await this.prisma.mediaAsset.delete({
        where: { id },
      })

      return { success: true }
    } catch (error) {
      this.logger.error(`Error deleting asset ${id}:`, error)
      throw new BadRequestException('Failed to delete asset')
    }
  }

  async getStorageStats() {
    try {
      const [totalAssets, totalSize, assetsByType, recentUploads] = await Promise.all([
        this.prisma.mediaAsset.count(),
        this.prisma.mediaAsset.aggregate({
          _sum: { size: true },
        }),
        this.prisma.mediaAsset.groupBy({
          by: ['mimeType'],
          _count: true,
          _sum: { size: true },
        }),
        this.prisma.mediaAsset.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ])

      const totalSizeNumber = totalSize._sum.size ? Number(totalSize._sum.size) : 0

      return {
        totalAssets,
        totalSize: totalSizeNumber,
        assetsByType: assetsByType.map((item) => ({
          mimeType: item.mimeType,
          count: item._count,
          size: Number(item._sum.size),
        })),
        recentUploads,
      }
    } catch (error) {
      this.logger.error('Error getting storage stats:', error)
      throw new BadRequestException('Failed to get storage stats')
    }
  }

  async testConnection() {
    try {
      // Test if upload directory is accessible
      await fs.access(this.uploadDir, fs.constants.W_OK)

      // Test if we can write a small file
      const testFile = path.join(this.uploadDir, '.test')
      await fs.writeFile(testFile, 'test')
      await fs.unlink(testFile)

      return {
        success: true,
        provider: this.storageProvider,
        uploadDir: this.uploadDir,
      }
    } catch (error) {
      this.logger.error('Storage connection test failed:', error)
      return {
        success: false,
        provider: this.storageProvider,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private generateStorageKey(originalName: string, hash: string): string {
    const ext = path.extname(originalName)
    const timestamp = Date.now()
    return `${timestamp}-${hash.substring(0, 8)}${ext}`
  }

  private async saveFile(sourcePath: string, storageKey: string) {
    const destPath = path.join(this.uploadDir, storageKey)
    await fs.mkdir(path.dirname(destPath), { recursive: true })
    await fs.copyFile(sourcePath, destPath)
  }

  private getFileUrl(storageKey: string): string {
    if (this.storageProvider === 'local') {
      return `/uploads/${storageKey}`
    }
    // For S3/MinIO, would return CDN URL
    return `/api/storage/file/${storageKey}`
  }

  private async getImageDimensions(_filePath: string): Promise<{ width: number; height: number }> {
    try {
      // For now, return dummy dimensions
      // In production, use sharp or similar library
      return { width: 0, height: 0 }
    } catch {
      return { width: 0, height: 0 }
    }
  }
}

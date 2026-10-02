/**
 * IRIB Digital Workplace Platform - Media Service
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
import { createHash } from 'crypto'
import sharp from 'sharp'
import * as minio from 'minio'

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name)
  private readonly minioEndpoint: string
  private readonly minioAccessKey: string
  private readonly minioSecretKey: string
  private readonly minioBucket: string
  private readonly useMinio: boolean
  private readonly maxFileSize: number
  private readonly allowedMimeTypes: string[]

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    this.minioEndpoint = this.config.get<string>('MINIO_ENDPOINT', 'http://localhost:9000')
    this.minioAccessKey = this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin')
    this.minioSecretKey = this.config.get<string>('MINIO_SECRET_KEY', 'minioadmin')
    this.minioBucket = this.config.get<string>('MINIO_BUCKET', 'irib-dwp-media')
    this.useMinio = this.config.get<string>('USE_MINIO', 'true') === 'true'
    this.maxFileSize = this.config.get<number>('MAX_FILE_SIZE', 50 * 1024 * 1024) // 50MB
    this.allowedMimeTypes = this.config
      .get<string>(
        'ALLOWED_MIME_TYPES',
        'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,audio/mpeg,audio/wav,application/pdf'
      )
      .split(',')
  }

  async upload(file: Express.Multer.File, userId: string) {
    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`
      )
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`)
    }

    const hash = createHash('sha256').update(file.buffer).digest('hex')
    const storageKey = `uploads/${hash}/${file.originalname}`

    let processedBuffer = file.buffer
    const metadata: any = {
      width: undefined,
      height: undefined,
      format: undefined,
    }

    // Process images
    if (file.mimetype.startsWith('image/')) {
      try {
        const image = sharp(file.buffer)
        const meta = await image.metadata()
        metadata.width = meta.width
        metadata.height = meta.height
        metadata.format = meta.format

        // Optimize images
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          processedBuffer = await image
            .jpeg({ quality: 85 })
            .png({ compressionLevel: 9 })
            .webp({ quality: 85 })
            .toBuffer()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        this.logger.warn(`Image processing failed: ${message}`)
      }
    }

    // Upload to MinIO if enabled
    let url: string | undefined
    if (this.useMinio) {
      try {
        url = await this.uploadToMinio(storageKey, processedBuffer, file.mimetype)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        this.logger.error(`MinIO upload failed: ${message}`)
        throw new BadRequestException('Failed to upload file to storage')
      }
    }

    const mediaAssetData: any = {
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: processedBuffer.length,
      hash: hash,
      storageKey: storageKey,
      metadata: metadata as any,
      uploadedById: userId,
    }

    if (url) {
      mediaAssetData.url = url
    }

    return this.prisma.mediaAsset.create({
      data: mediaAssetData,
    })
  }

  async findOne(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } })
  }

  async delete(id: string) {
    const media = await this.prisma.mediaAsset.findUnique({ where: { id } })
    if (!media) {
      throw new BadRequestException('Media not found')
    }

    // Delete from MinIO if enabled
    if (this.useMinio && media.storageKey) {
      try {
        await this.deleteFromMinio(media.storageKey)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        this.logger.error(`MinIO deletion failed: ${message}`)
      }
    }

    return this.prisma.mediaAsset.delete({ where: { id } })
  }

  async getUploadStats() {
    const [totalFiles, totalSize, byType] = await Promise.all([
      this.prisma.mediaAsset.count(),
      this.prisma.mediaAsset.aggregate({
        _sum: { size: true },
      }),
      this.prisma.mediaAsset.groupBy({
        by: ['mimeType'],
        _count: true,
      }),
    ])

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      byType: byType.map(({ mimeType, _count }) => ({
        mimeType,
        count: _count,
      })),
    }
  }

  private async uploadToMinio(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    // This is a placeholder for MinIO SDK integration
    // In production, use @minio/minio package
    const client = new minio.Client({
      endPoint: this.minioEndpoint.replace('http://', '').replace('https://', '').split(':')[0],
      port: parseInt(this.minioEndpoint.split(':')[1]) || 9000,
      useSSL: this.minioEndpoint.startsWith('https://'),
      accessKey: this.minioAccessKey,
      secretKey: this.minioSecretKey,
    })

    await client.putObject(this.minioBucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
    })
    return `${this.minioEndpoint}/${this.minioBucket}/${key}`
  }

  private async deleteFromMinio(key: string): Promise<void> {
    const client = new minio.Client({
      endPoint: this.minioEndpoint.replace('http://', '').replace('https://', '').split(':')[0],
      port: parseInt(this.minioEndpoint.split(':')[1]) || 9000,
      useSSL: this.minioEndpoint.startsWith('https://'),
      accessKey: this.minioAccessKey,
      secretKey: this.minioSecretKey,
    })

    await client.removeObject(this.minioBucket, key)
  }
}

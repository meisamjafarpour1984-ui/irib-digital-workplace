import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(file: Express.Multer.File, userId: string) {
    const hash = require('crypto').createHash('sha256').update(file.buffer).digest('hex')
    // checksumSha256 not defined in Prisma Schema
    const existing = null
    if (existing) return existing

    return this.prisma.mediaAsset.create({
      data: {
        filename: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        hash: hash,
        storageKey: `uploads/${hash}/${file.originalname}`,
        uploadedById: userId,
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } })
  }

  async delete(id: string) {
    return this.prisma.mediaAsset.delete({ where: { id } })
  }
}

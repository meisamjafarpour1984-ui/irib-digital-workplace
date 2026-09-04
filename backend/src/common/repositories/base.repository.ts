<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/repositories/base.repository.ts
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract getModelName(): string

  async findById(id: string): Promise<T | null> {
    return this.prisma[this.getModelName()].findUnique({
      where: { id },
    })
  }

  async findMany(params?: {
    where?: Prisma.Args<T>['where']
    orderBy?: Prisma.Args<T>['orderBy']
    take?: number
    skip?: number
    include?: Prisma.Args<T>['include']
    select?: Prisma.Args<T>['select']
  }): Promise<T[]> {
    return this.prisma[this.getModelName()].findMany(params)
  }

  async create(data: CreateInput): Promise<T> {
    return this.prisma[this.getModelName()].create({
      data,
    })
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.prisma[this.getModelName()].update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<T> {
    return this.prisma[this.getModelName()].delete({
      where: { id },
    })
  }

  async count(where?: Prisma.Args<T>['where']): Promise<number> {
    return this.prisma[this.getModelName()].count({ where })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.count({ id } as any)
    return count > 0
  }
}
=======
import { PrismaService } from '../../prisma/prisma.service'

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract getModelName(): string

  async findById(id: string): Promise<T | null> {
    return (this.prisma as any)[this.getModelName()].findUnique({
      where: { id },
    })
  }

  async findMany(params?: any): Promise<T[]> {
    return (this.prisma as any)[this.getModelName()].findMany(params)
  }

  async create(data: CreateInput): Promise<T> {
    return (this.prisma as any)[this.getModelName()].create({
      data,
    })
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return (this.prisma as any)[this.getModelName()].update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<T> {
    return (this.prisma as any)[this.getModelName()].delete({
      where: { id },
    })
  }

  async count(where?: any): Promise<number> {
    return (this.prisma as any)[this.getModelName()].count({ where })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.count({ id })
    return count > 0
  }
}
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/repositories/base.repository.ts

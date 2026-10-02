import { PrismaService } from '../../prisma/prisma.service'

type RepositoryModel<T, CreateInput, UpdateInput> = {
  findUnique(args: { where: { id: string } }): Promise<T | null>
  findMany(params?: unknown): Promise<T[]>
  create(args: { data: CreateInput }): Promise<T>
  update(args: { where: { id: string }; data: UpdateInput }): Promise<T>
  delete(args: { where: { id: string } }): Promise<T>
  count(args: { where?: unknown }): Promise<number>
}

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract getModelName(): string

  private getModel(): RepositoryModel<T, CreateInput, UpdateInput> {
    return (this.prisma as unknown as Record<string, RepositoryModel<T, CreateInput, UpdateInput>>)[
      this.getModelName()
    ]
  }

  async findById(id: string): Promise<T | null> {
    return this.getModel().findUnique({
      where: { id },
    })
  }

  async findMany(params?: unknown): Promise<T[]> {
    return this.getModel().findMany(params)
  }

  async create(data: CreateInput): Promise<T> {
    return this.getModel().create({
      data,
    })
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.getModel().update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<T> {
    return this.getModel().delete({
      where: { id },
    })
  }

  async count(where?: unknown): Promise<number> {
    return this.getModel().count({ where })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.count({ id })
    return count > 0
  }
}

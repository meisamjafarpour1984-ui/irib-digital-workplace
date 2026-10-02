import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger, Optional } from '@nestjs/common'
import { Job } from 'bullmq'
import { ContentIndexingJobData } from '../queue.service'
import { SearchService } from '@/modules/search/search.service'

@Processor('content-indexing')
export class IndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexingProcessor.name)

  constructor(@Optional() private searchService?: SearchService) {
    super()
  }

  async process(job: Job<ContentIndexingJobData>) {
    this.logger.log(`Processing content indexing job ${job.id}`)

    try {
      const { contentId, action } = job.data

      if (this.searchService) {
        // Index/update/delete content in OpenSearch
        switch (action) {
          case 'create':
            await this.searchService.indexContent(contentId)
            break
          case 'update':
            await this.searchService.updateIndex(contentId)
            break
          case 'delete':
            await this.searchService.deleteFromIndex(contentId)
            break
        }
      } else {
        // Fallback: log and skip
        this.logger.log(
          `Content indexing for ${contentId} with action: ${action} (service not available)`
        )
      }

      this.logger.log(`Content indexing processed: ${contentId} with action: ${action}`)
      return { success: true, contentId, action }
    } catch (error) {
      this.logger.error(`Failed to index content`, error)
      throw error
    }
  }
}

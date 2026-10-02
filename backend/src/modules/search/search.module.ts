import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SearchController } from './search.controller'
import { SearchService } from './search.service'
import { Client as OpenSearchClient } from '@opensearch-project/opensearch'

const openSearchClientProvider = {
  provide: 'OPENSEARCH_CLIENT',
  useFactory: (configService: ConfigService) => {
    const host = configService.get('OPENSEARCH_HOST', 'localhost')
    const port = configService.get('OPENSEARCH_PORT', 9200)
    const node = `http://${host}:${port}`

    try {
      return new OpenSearchClient({
        node,
      })
    } catch (error) {
      console.warn('Failed to initialize OpenSearch client:', error)
      return null
    }
  },
  inject: [ConfigService],
}

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    openSearchClientProvider,
    {
      provide: 'SearchService',
      useExisting: SearchService,
    },
  ],
  exports: [SearchService, 'SearchService'],
})
export class SearchModule {}

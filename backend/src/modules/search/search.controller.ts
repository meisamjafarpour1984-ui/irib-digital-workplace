import { Controller, Get, Post, Query, Body } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SearchQueryDto } from './search.dto'
import { SearchService } from './search.service'

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search published content' })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query)
  }

  @Post('reindex')
  @ApiOperation({ summary: 'Reindex all published content to OpenSearch' })
  async reindex() {
    return this.searchService.reindexAll()
  }

  @Post('index/:id')
  @ApiOperation({ summary: 'Index a specific content item' })
  async indexContent(@Body('id') id: string) {
    return this.searchService.indexContent(id)
  }

  @Post('delete/:id')
  @ApiOperation({ summary: 'Delete content from search index' })
  async deleteFromIndex(@Body('id') id: string) {
    return this.searchService.deleteFromIndex(id)
  }
}

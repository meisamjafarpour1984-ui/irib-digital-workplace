import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SearchQueryDto } from './search.dto'
import { SearchService } from './search.service'

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search published content in PostgreSQL' })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query)
  }
}

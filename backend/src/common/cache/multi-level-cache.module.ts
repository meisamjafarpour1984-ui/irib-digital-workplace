import { Module } from '@nestjs/common';
import { MultiLevelCacheService } from './multi-level-cache.service';
import { CacheModule } from '../../modules/cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [MultiLevelCacheService],
  exports: [MultiLevelCacheService],
})
export class MultiLevelCacheModule {}

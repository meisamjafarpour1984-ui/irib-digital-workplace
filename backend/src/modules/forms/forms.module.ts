import { Module } from '@nestjs/common'
import { FormsController } from './forms.controller'
import { FormsService } from './forms.service'
import { AfishController } from './afish.controller'
import { AfishService } from './afish.service'

@Module({
  controllers: [FormsController, AfishController],
  providers: [FormsService, AfishService],
  exports: [FormsService, AfishService],
})
export class FormsModule {}

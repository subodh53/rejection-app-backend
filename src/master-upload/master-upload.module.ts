import { Module } from '@nestjs/common';
import { MasterUploadController } from './master-upload.controller';
import { MasterUploadService } from './master-upload.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MasterUploadController],
  providers: [MasterUploadService],
})
export class MasterUploadModule {}

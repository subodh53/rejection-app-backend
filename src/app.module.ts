import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PartsModule } from './parts/parts.module';
import { CategoriesModule } from './categories/categories.module';
import { StagesModule } from './stages/stages.module';
import { DefectsModule } from './defects/defects.module';
import { ProductionModule } from './production/production.module';
import { RejectionsModule } from './rejections/rejections.module';
import { EntriesModule } from './entries/entries.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { DatabaseModule } from './database/database.module';
import { MasterUploadModule } from './master-upload/master-upload.module';

@Module({
  imports: [AuthModule, UsersModule, PartsModule, CategoriesModule, StagesModule, DefectsModule, ProductionModule, RejectionsModule, EntriesModule, ReportsModule, AuditLogsModule, DatabaseModule, MasterUploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

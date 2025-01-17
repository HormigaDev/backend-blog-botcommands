import { Global, Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from 'src/common/models/log.entity';
import { AuditLog } from 'src/common/models/audit-log.entity';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog, Log])],
    providers: [AuditLogsService],
    exports: [AuditLogsService],
})
export class LogsModule {}

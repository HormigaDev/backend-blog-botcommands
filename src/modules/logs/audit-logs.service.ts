import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogInterface } from 'src/common/interfaces/audit-log.interface';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { AuditLog } from 'src/common/models/audit-log.entity';
import { Log } from 'src/common/models/log.entity';
import { Repository } from 'typeorm';
import { CustomError } from 'src/common/types/CustomError.type';
import { stringify } from 'flatted';

@Injectable()
export class AuditLogsService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        @InjectRepository(Log)
        private readonly logRepository: Repository<Log>,
    ) {}

    async create(log: AuditLogInterface): Promise<void> {
        try {
            log = this.auditLogRepository.create(log);
            await this.auditLogRepository.save(log);
        } catch (error) {
            throw new CustomError({ functionOrMethod: 'AuditLogsService/create', error });
        }
    }

    async findAll(pagination: PaginationInterface): Promise<AuditLog[]> {
        try {
            return await this.auditLogRepository.find({
                skip: pagination.limit * (pagination.page - 1),
                take: pagination.limit,
                order: { logDate: 'DESC' },
            });
        } catch (error) {
            throw new CustomError({ functionOrMethod: 'AuditLogsService/findAll', error });
        }
    }

    async log(content: any): Promise<void> {
        try {
            const log = this.logRepository.create({ content: stringify(content) });
            await this.logRepository.save(log);
        } catch (error) {
            throw new CustomError({ functionOrMethod: 'AuditLogsService/log', error });
        }
    }
}

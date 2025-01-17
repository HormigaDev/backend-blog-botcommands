import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLog } from 'src/common/models/audit-log.entity';
import { Log } from 'src/common/models/log.entity';
import { Repository } from 'typeorm';
import { CustomError } from 'src/common/types/CustomError.type';
import { SqlAction } from 'src/common/enums/SqlAction.enum';

jest.mock('src/common/models/audit-log.entity');
jest.mock('src/common/models/log.entity');

describe('AuditLogsService', () => {
    let service: AuditLogsService;
    let auditLogRepository: Repository<AuditLog>;
    let logRepository: Repository<Log>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditLogsService,
                {
                    provide: getRepositoryToken(AuditLog),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Log),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<AuditLogsService>(AuditLogsService);
        auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
        logRepository = module.get<Repository<Log>>(getRepositoryToken(Log));
    });

    describe('create', () => {
        it('debería crear un nuevo log de auditoría', async () => {
            const log: any = { logDate: new Date(), action: 'create', details: 'some details' };

            const saveMock = jest.spyOn(auditLogRepository, 'save').mockResolvedValue(log);
            const createMock = jest.spyOn(auditLogRepository, 'create').mockReturnValue(log);

            await service.create(log);

            expect(createMock).toHaveBeenCalledWith(log);
            expect(saveMock).toHaveBeenCalledWith(log);
        });

        it('debería lanzar un CustomError si ocurre un error al crear un log', async () => {
            const log: any = { logDate: new Date(), action: 'create', details: 'some details' };
            jest.spyOn(auditLogRepository, 'save').mockRejectedValue(new Error('Test error'));

            await expect(service.create(log)).rejects.toThrowError(CustomError);
        });
    });

    describe('findAll', () => {
        it('debería devolver una lista de logs de auditoría', async () => {
            const pagination = { page: 1, limit: 10 };
            const mockLogs = [
                {
                    id: 1,
                    logDate: new Date(),
                    operation: SqlAction.Insert,
                    details: 'some details',
                    userId: 1,
                    rowId: 1,
                    tableName: 'test',
                },
                {
                    id: 2,
                    logDate: new Date(),
                    operation: SqlAction.Update,
                    details: 'some other details',
                    userId: 1,
                    rowId: 1,
                    tableName: 'test',
                },
            ];

            jest.spyOn(auditLogRepository, 'find').mockResolvedValue(mockLogs);

            const result = await service.findAll(pagination);

            expect(result).toEqual(mockLogs);
            expect(auditLogRepository.find).toHaveBeenCalledWith({
                skip: pagination.limit * (pagination.page - 1),
                take: pagination.limit,
                order: { logDate: 'DESC' },
            });
        });

        it('debería lanzar un CustomError si ocurre un error al obtener los logs', async () => {
            const pagination = { page: 1, limit: 10 };
            jest.spyOn(auditLogRepository, 'find').mockRejectedValue(new Error('Test error'));

            await expect(service.findAll(pagination)).rejects.toThrowError(CustomError);
        });
    });

    describe('log', () => {
        it('debería crear un nuevo log', async () => {
            const content = { id: 1, content: 'content', logDate: new Date() };

            const saveMock = jest.spyOn(logRepository, 'save').mockResolvedValue(content);
            const createMock = jest.spyOn(logRepository, 'create').mockReturnValue(content);

            await service.log(content);

            expect(createMock).toHaveBeenCalledWith({ content: JSON.stringify(content) });
            expect(saveMock).toHaveBeenCalledWith(content);
        });

        it('debería lanzar un CustomError si ocurre un error al crear el log', async () => {
            const content = { action: 'user_login', userId: 1 };
            jest.spyOn(logRepository, 'save').mockRejectedValue(new Error('Test error'));

            await expect(service.log(content)).rejects.toThrowError(CustomError);
        });
    });
});

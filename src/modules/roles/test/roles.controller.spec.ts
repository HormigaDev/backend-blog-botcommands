import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';
import { AuditLogsService } from 'src/modules/logs/audit-logs.service';
import { SqlAction } from 'src/common/enums/SqlAction.enum';
import { UsersService } from 'src/modules/users/users.service';

describe('RolesController', () => {
    let controller: RolesController;
    let rolesService: jest.Mocked<RolesService>;
    let logService: jest.Mocked<AuditLogsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RolesController],
            providers: [
                {
                    provide: RolesService,
                    useValue: {
                        findAll: jest.fn(),
                        create: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: AuditLogsService,
                    useValue: {
                        create: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<RolesController>(RolesController);
        rolesService = module.get(RolesService);
        logService = module.get(AuditLogsService);
    });

    it('Debería estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('getRoles', () => {
        it('Debería retonrar una lista de roles', async () => {
            const mockPagination = { page: 1, limit: 10 };
            const mockRoles = [{ id: 1, name: 'Admin', permissions: 8 }];
            rolesService.findAll.mockResolvedValue(mockRoles);

            const result = await controller.getRoles(mockPagination);
            expect(rolesService.findAll).toHaveBeenCalledWith(mockPagination);
            expect(result).toEqual({ roles: mockRoles });
        });
    });

    describe('createRole', () => {
        it('Debería crear un rol y registrar un log', async () => {
            const mockBody = { name: 'Admin', permissions: 8 };
            const mockRole = { id: 1, name: 'Admin', permissions: 8 };
            const mockRequest = { user: { userId: 123 } };

            rolesService.create.mockResolvedValue(mockRole);
            logService.create.mockResolvedValue(null);

            const result = await controller.createRole(mockBody, mockRequest);

            expect(rolesService.create).toHaveBeenCalledWith(mockBody);

            expect(logService.create).toHaveBeenCalledWith({
                details: JSON.stringify({
                    old: null,
                    new: mockRole,
                }),
                operation: SqlAction.Insert,
                rowId: mockRole.id,
                tableName: 'roles',
                userId: mockRequest.user.userId,
            });

            expect(result).toEqual({ role: mockRole });
        });
    });

    describe('updateRole', () => {
        it('Debería actualizar un rol y registrar un log', async () => {
            const mockId = 1;
            const mockBody = { name: 'Updated Admin', permissions: 4 };
            const mockOldRole = { id: 1, name: 'Admin', permissions: 8 };
            const mockNewRole = { id: 1, name: 'Updated Admin', permissions: 4 };
            const mockRequest = { user: { userId: 123 } };

            rolesService.findOne.mockResolvedValue(mockOldRole);
            rolesService.update.mockResolvedValue(mockNewRole);
            logService.create.mockResolvedValue(null);

            const result = await controller.updateRole(mockBody, mockId, mockRequest);

            expect(rolesService.findOne).toHaveBeenCalledWith(mockId);

            expect(rolesService.update).toHaveBeenCalledWith(mockId, mockBody);

            expect(logService.create).toHaveBeenCalledWith({
                details: JSON.stringify({
                    old: mockOldRole,
                    new: mockNewRole,
                }),
                operation: SqlAction.Update,
                rowId: mockId,
                tableName: 'roles',
                userId: mockRequest.user.userId,
            });

            expect(result).toEqual({});
        });
    });

    describe('deleteRole', () => {
        it('Debería eliminar un rol y registrar un log', async () => {
            const mockId = 1;
            const mockRole = { id: 1, name: 'Admin', permissions: 8 };
            const mockRequest = { user: { userId: 123 } };

            rolesService.delete.mockResolvedValue(mockRole);
            logService.create.mockResolvedValue(null);

            const result = await controller.deleteRole(mockId, mockRequest);

            expect(rolesService.delete).toHaveBeenCalledWith(mockId);

            expect(logService.create).toHaveBeenCalledWith({
                details: JSON.stringify({
                    old: mockRole,
                    new: null,
                }),
                operation: SqlAction.Delete,
                rowId: mockId,
                tableName: 'roles',
                userId: mockRequest.user.userId,
            });

            expect(result).toEqual({});
        });
    });
});

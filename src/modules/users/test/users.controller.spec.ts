import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';
import { AuditLogsService } from 'src/modules/logs/audit-logs.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { SqlAction } from 'src/common/enums/SqlAction.enum';
import { CreateUserDto } from 'src/common/validators/create-user.dto';
import { UpdateUserDto } from 'src/common/validators/update-user.dto';
import { stringify } from 'flatted';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: jest.Mocked<UsersService>;
    let logService: jest.Mocked<AuditLogsService>;

    beforeEach(async () => {
        const mockUsersService = {
            findAll: jest.fn(),
            countAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const mockAuditLogsService = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
                { provide: AuditLogsService, useValue: mockAuditLogsService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .overrideGuard(PermissionsGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<UsersController>(UsersController);
        usersService = module.get(UsersService);
        logService = module.get(AuditLogsService);
    });

    it('debería estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('getUsers', () => {
        it('debería devolver una lista de usuarios y su conteo', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'John Doe',
                    password: 'hashedPassword',
                    email: 'jest@example.com',
                    status: 1,
                    createdAt: new Date(),
                    lastUpdate: new Date(),
                    clearPassword: jest.fn(function () {
                        return this;
                    }),
                },
            ];
            usersService.findAll.mockResolvedValue(mockUsers);
            usersService.countAll.mockResolvedValue(1);

            const result = await controller.getUsers({ page: 1, limit: 10 });
            expect(result).toEqual({ users: mockUsers, count: 1 });
            expect(usersService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
            expect(usersService.countAll).toHaveBeenCalled();
        });
    });

    describe('createUser', () => {
        it('debería crear un usuario y registrar un log', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: jest.fn(function () {
                    return this;
                }),
            };
            usersService.create.mockResolvedValue(mockUser as any);

            const body: CreateUserDto = { email: 'test@test.com', password: '12345', name: 'Test' };
            const req = { user: { userId: 1 } };

            const result = await controller.createUser(body, req);
            expect(result).toEqual({ user: mockUser });
            expect(usersService.create).toHaveBeenCalledWith(body);
            expect(logService.create).toHaveBeenCalledWith({
                operation: SqlAction.Insert,
                tableName: 'users',
                rowId: mockUser.id,
                userId: req.user.userId,
                details: stringify({ old: null, new: mockUser }),
            });
        });
    });

    describe('updateUser', () => {
        it('debería actualizar un usuario y registrar un log', async () => {
            const mockOldUser = {
                id: 1,
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: jest.fn(function () {
                    return this;
                }),
            };
            const mockUpdatedUser = {
                id: 1,
                name: 'John Doee',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: jest.fn(function () {
                    return this;
                }),
            };

            usersService.findOne.mockResolvedValue(mockOldUser as any);
            usersService.update.mockResolvedValue(mockUpdatedUser as any);

            const body: UpdateUserDto = { name: 'Updated Name' };
            const req = { user: { userId: 1 } };
            const id = 1;

            const result = await controller.updateUser(body, id, req);
            expect(result).toEqual({});
            expect(usersService.findOne).toHaveBeenCalledWith(id);
            expect(usersService.update).toHaveBeenCalledWith(id, body);
            expect(logService.create).toHaveBeenCalledWith({
                details: stringify({ old: mockOldUser, new: mockUpdatedUser }),
                operation: SqlAction.Update,
                rowId: id,
                tableName: 'users',
                userId: req.user.userId,
            });
        });
    });

    describe('deleteUser', () => {
        it('debería eliminar un usuario y registrar un log', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: jest.fn(function () {
                    return this;
                }),
            };
            usersService.delete.mockResolvedValue(mockUser as any);

            const req = { user: { userId: 1 } };
            const id = 1;

            const result = await controller.deleteUser(id, req);
            expect(result).toEqual({});
            expect(usersService.delete).toHaveBeenCalledWith(id);
            expect(logService.create).toHaveBeenCalledWith({
                details: stringify({ old: mockUser, new: null }),
                operation: SqlAction.Delete,
                rowId: mockUser.id,
                tableName: 'users',
                userId: req.user.userId,
            });
        });
    });
});

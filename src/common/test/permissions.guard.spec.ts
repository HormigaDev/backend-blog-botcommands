import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/modules/users/users.service';
import { RolesService } from 'src/modules/roles/roles.service';
import { ForbiddenException } from '@nestjs/common';

const mockUser = {
    id: 1,
    email: 'user@example.com',
    password: 'hashedpassword',
    name: 'John Doe',
    status: 1, // Suponiendo que "1" representa un estado activo de acuerdo a tu enum UserStatus
    createdAt: new Date(),
    lastUpdate: new Date(),
    clearPassword: jest.fn().mockReturnValue({}),
};

const mockRoles = [
    {
        id: 1,
        name: 'Admin',
        permissions: 7, // Asumiendo que los permisos están representados por números, por ejemplo, 7
    },
];

describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;
    let usersService: UsersService;
    let rolesService: RolesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionsGuard,
                {
                    provide: Reflector,
                    useValue: { get: jest.fn() },
                },
                {
                    provide: UsersService,
                    useValue: { findOne: jest.fn() },
                },
                {
                    provide: RolesService,
                    useValue: { findByUser: jest.fn() },
                },
            ],
        }).compile();

        guard = module.get<PermissionsGuard>(PermissionsGuard);
        reflector = module.get<Reflector>(Reflector);
        usersService = module.get<UsersService>(UsersService);
        rolesService = module.get<RolesService>(RolesService);
    });

    it('debería permitir el acceso si el usuario tiene permisos y está activo', async () => {
        const permissions = [1, 2];
        const context: any = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { userId: 1 },
                }),
            }),
            getHandler: jest.fn(),
        };

        jest.spyOn(reflector, 'get').mockReturnValue({ permissions, optional: false });
        jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(rolesService, 'findByUser').mockResolvedValue(mockRoles);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('debería denegar el acceso si el usuario no está activo', async () => {
        const context: any = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { userId: 1 },
                }),
            }),
            getHandler: jest.fn(),
        };

        jest.spyOn(reflector, 'get').mockReturnValue({ permissions: [1], optional: false });
        jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(rolesService, 'findByUser').mockResolvedValue([]);

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('debería denegar el acceso si el usuario no tiene permisos', async () => {
        const context: any = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { userId: 1 },
                }),
            }),
            getHandler: jest.fn(),
        };

        jest.spyOn(reflector, 'get').mockReturnValue({ permissions: [1], optional: false });
        jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

        const rolesWithoutPermission = [{ permissions: 0, name: 'None', id: 1 }];
        jest.spyOn(rolesService, 'findByUser').mockResolvedValue(rolesWithoutPermission);

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('debería permitir el acceso si el permiso es opcional y el usuario tiene al menos un permiso', async () => {
        const permissions = [1];
        const context: any = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { userId: 1 },
                }),
            }),
            getHandler: jest.fn(),
        };

        jest.spyOn(reflector, 'get').mockReturnValue({ permissions, optional: true });
        jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(rolesService, 'findByUser').mockResolvedValue(mockRoles);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('debería denegar el acceso si el permiso es opcional y el usuario no tiene permisos', async () => {
        const permissions = [1];
        const context: any = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { userId: 1 },
                }),
            }),
            getHandler: jest.fn(),
        };

        jest.spyOn(reflector, 'get').mockReturnValue({ permissions, optional: true });
        jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

        const rolesWithoutPermission = [{ permissions: 0, name: 'None', id: 1 }];
        jest.spyOn(rolesService, 'findByUser').mockResolvedValue(rolesWithoutPermission);

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
});

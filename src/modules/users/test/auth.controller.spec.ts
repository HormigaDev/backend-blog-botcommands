import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/modules/users/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { UsersService } from 'src/modules/users/users.service';
import { AuditLogsService } from 'src/modules/logs/audit-logs.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { IpWhitelistGuard } from 'src/common/guards/ip-whitelist.guard';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { SqlAction } from 'src/common/enums/SqlAction.enum';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;
    let usersService: jest.Mocked<UsersService>;
    let logService: jest.Mocked<AuditLogsService>;
    let mockResponse: Partial<Response>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        passwordIsEqual: jest.fn(),
                        generateToken: jest.fn(),
                        hashPassword: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findOneByEmail: jest.fn(),
                        findOne: jest.fn(),
                        updatePassword: jest.fn(),
                    },
                },
                {
                    provide: AuditLogsService,
                    useValue: {
                        create: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(IpWhitelistGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
        usersService = module.get(UsersService);
        logService = module.get(AuditLogsService);

        mockResponse = {
            cookie: jest.fn(),
            clearCookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
    });

    it('debería estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('debería autenticar correctamente y establecer una cookie', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: () => {
                    delete mockUser.password;
                    return mockUser;
                },
            };
            const mockToken = 'jwt-token';

            usersService.findOneByEmail.mockResolvedValue(mockUser);
            authService.passwordIsEqual.mockResolvedValue(true);
            authService.generateToken.mockResolvedValue(mockToken);

            await controller.login(
                { email: 'test@example.com', password: 'password123' },
                mockResponse as Response,
            );

            expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
            expect(authService.passwordIsEqual).toHaveBeenCalledWith(
                'password123',
                'hashedPassword',
            );
            expect(authService.generateToken).toHaveBeenCalledWith({
                sub: mockUser.id,
                username: mockUser.name,
            });
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                'auth_token',
                mockToken,
                expect.objectContaining({
                    httpOnly: true,
                    secure: expect.any(Boolean),
                    sameSite: 'strict',
                    maxAge: 4 * 60 * 60 * 1000,
                }),
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Login successful' });
        });

        it('debería lanzar UnauthorizedException si las credenciales son incorrectas', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: () => {
                    delete mockUser.password;
                    return mockUser;
                },
            };

            usersService.findOneByEmail.mockResolvedValue(mockUser);
            authService.passwordIsEqual.mockResolvedValue(false);

            await expect(
                controller.login(
                    { email: 'test@example.com', password: 'wrongPassword' },
                    mockResponse as Response,
                ),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('debería limpiar la cookie y retornar éxito', async () => {
            await controller.logout(mockResponse as Response);

            expect(mockResponse.clearCookie).toHaveBeenCalledWith('auth_token');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logout successful' });
        });
    });

    describe('updatePassword', () => {
        it('debería actualizar la contraseña y registrar un log', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: () => {
                    delete mockUser.password;
                    return mockUser;
                },
            };
            authService.passwordIsEqual.mockResolvedValue(true);
            usersService.findOne.mockResolvedValue(mockUser);
            authService.hashPassword.mockResolvedValue('newHashedPassword');

            await controller.updatePassword(
                { prevPassword: 'oldPassword', newPassword: 'newPassword123' },
                { user: { userId: 1 } } as any,
            );

            expect(usersService.findOne).toHaveBeenCalledWith(1);
            expect(authService.passwordIsEqual).toHaveBeenCalledWith(
                'oldPassword',
                'hashedPassword',
            );
            expect(usersService.updatePassword).toHaveBeenCalledWith(1, 'newPassword123');
            expect(logService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    details: JSON.stringify({
                        old: 'password',
                        new: 'password',
                    }),
                    operation: SqlAction.Update,
                    rowId: 1,
                    tableName: 'users',
                    userId: 1,
                }),
            );
        });

        it('debería lanzar UnauthorizedException si la contraseña previa es incorrecta', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'jest@example.com',
                status: 1,
                createdAt: new Date(),
                lastUpdate: new Date(),
                clearPassword: () => {
                    delete mockUser.password;
                    return mockUser;
                },
            };
            authService.passwordIsEqual.mockResolvedValue(false);
            usersService.findOne.mockResolvedValue(mockUser);

            await expect(
                controller.updatePassword(
                    { prevPassword: 'wrongPassword', newPassword: 'newPassword123' },
                    { user: { userId: 1 } } as any,
                ),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});

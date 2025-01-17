import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/common/models/user.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { UserStatus } from 'src/common/enums/UserStatus.enum';

describe('UsersService', () => {
    let service: UsersService;
    let repository: jest.Mocked<Repository<User>>;
    let authService: jest.Mocked<AuthService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOneBy: jest.fn(),
                        count: jest.fn(),
                        save: jest.fn(),
                        createQueryBuilder: jest.fn(() => ({
                            update: jest.fn().mockReturnThis(),
                            set: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            execute: jest.fn(),
                        })),
                    },
                },
                {
                    provide: AuthService,
                    useValue: {
                        hashPassword: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get(getRepositoryToken(User));
        authService = module.get(AuthService);
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('debería retornar una lista de usuarios con paginación válida', async () => {
            const mockUsers = [{ id: 1, email: 'test@example.com' }];
            repository.find.mockResolvedValue(mockUsers as User[]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result).toEqual(mockUsers);
            expect(repository.find).toHaveBeenCalledWith({ skip: 0, take: 10 });
        });

        it('debería lanzar BadRequestException para paginación inválida', async () => {
            await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('findOne', () => {
        it('debería retornar un usuario por ID', async () => {
            const mockUser = { id: 1, email: 'test@example.com' } as User;
            repository.findOneBy.mockResolvedValue(mockUser);

            const result = await service.findOne(1);
            expect(result).toEqual(mockUser);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('debería crear un nuevo usuario', async () => {
            const mockDto = { email: 'new@example.com', password: 'password123', name: 'New User' };
            const mockUser = { id: 1, ...mockDto } as User;

            repository.findOneBy.mockResolvedValue(null); // checkUserExists
            authService.hashPassword.mockResolvedValue('hashedPassword');
            repository.save.mockResolvedValue(mockUser);

            const result = await service.create(mockDto);

            expect(result).toEqual(mockUser);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: 'new@example.com' });
            expect(authService.hashPassword).toHaveBeenCalledWith('password123');
            expect(repository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'new@example.com',
                    password: 'hashedPassword',
                    name: 'New User',
                }),
            );
        });

        it('debería lanzar ConflictException si el email ya existe', async () => {
            const mockDto = {
                email: 'existing@example.com',
                password: 'password123',
                name: 'Existing User',
            };
            repository.findOneBy.mockResolvedValue({ id: 1, email: mockDto.email } as User);

            await expect(service.create(mockDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('delete', () => {
        it('debería marcar un usuario como eliminado', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                status: UserStatus.Active,
            } as User;
            repository.findOneBy.mockResolvedValue(mockUser);

            const executeMock = jest.fn();
            repository.createQueryBuilder.mockReturnValue({
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                execute: executeMock,
            } as any);

            const result = await service.delete(1);

            expect(result).toEqual(mockUser);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(repository.createQueryBuilder).toHaveBeenCalled();
            expect(executeMock).toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.delete(1)).rejects.toThrow(NotFoundException);
        });
    });
});

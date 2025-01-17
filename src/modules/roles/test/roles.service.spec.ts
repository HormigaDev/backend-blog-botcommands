import { Test, TestingModule } from '@nestjs/testing';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from 'src/modules/roles/roles.service';
import { Role } from 'src/common/models/role.entity';
import { CreateRoleDto } from 'src/common/validators/create-role.dto';
import { UpdateRoleDto } from 'src/common/validators/update-role.dto';

describe('RolesService', () => {
    let service: RolesService;
    let repository: jest.Mocked<Repository<Role>>;

    let mockQueryBuilder: any;

    beforeEach(async () => {
        mockQueryBuilder = {
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
            where: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesService,
                {
                    provide: getRepositoryToken(Role),
                    useValue: {
                        createQueryBuilder: jest.fn(() => mockQueryBuilder),
                        findOneBy: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<RolesService>(RolesService);
        repository = module.get(getRepositoryToken(Role));
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('debería devolver una lista de roles', async () => {
            const mockRoles = [{ id: 1, name: 'Admin', permissions: 8 }] as Role[];

            mockQueryBuilder.getMany.mockResolvedValue(mockRoles);

            const result = await service.findAll({ page: 1, limit: 10 });
            expect(result).toEqual(mockRoles);
            expect(repository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // página 1 => skip(0)
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10); // límite 10
        });
    });

    describe('findOne', () => {
        it('debería devolver un rol si existe', async () => {
            const mockRole = { id: 1, name: 'Admin', permissions: 8 } as Role;
            repository.findOneBy.mockResolvedValue(mockRole);

            const result = await service.findOne(1);
            expect(result).toEqual(mockRole);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        });

        it('debería lanzar una excepción si el rol no existe', async () => {
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('debería crear un nuevo rol', async () => {
            const createRoleDto: CreateRoleDto = { name: 'User', permissions: 2 };
            const mockRole = { id: 1, ...createRoleDto } as Role;
            repository.save.mockResolvedValue(mockRole);

            const result = await service.create(createRoleDto);
            expect(result).toEqual(mockRole);
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(createRoleDto));
        });
    });

    describe('update', () => {
        it('debería actualizar un rol existente', async () => {
            const updateRoleDto: UpdateRoleDto = { name: 'Updated', permissions: 4 };
            const mockRole = { id: 1, name: 'Admin', permissions: 8 } as Role;

            // Configurar mocks
            repository.findOneBy.mockResolvedValue(mockRole);

            // Mock de métodos anidados de QueryBuilder
            const executeMock = jest.fn().mockImplementation(() => {
                mockRole.name = updateRoleDto.name;
                mockRole.permissions = updateRoleDto.permissions;
            });
            const whereMock = jest.fn().mockReturnValue({ execute: executeMock });
            const setMock = jest.fn().mockReturnValue({ where: whereMock });
            const updateMock = jest.fn().mockReturnValue({ set: setMock });

            repository.createQueryBuilder.mockReturnValue({
                update: updateMock,
            } as unknown as SelectQueryBuilder<Role>); // Type Assertion

            // Ejecutar el método
            const result = await service.update(1, updateRoleDto);

            // Verificar resultados
            expect(result).toEqual(
                expect.objectContaining({ id: 1, name: 'Updated', permissions: 4 }),
            );
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 }); // Verificar búsqueda inicial
            expect(repository.createQueryBuilder).toHaveBeenCalled(); // Verificar creación del QueryBuilder
            expect(updateMock).toHaveBeenCalled(); // Verificar llamada a update
            expect(setMock).toHaveBeenCalledWith(expect.objectContaining(updateRoleDto)); // Verificar datos pasados al set
            expect(whereMock).toHaveBeenCalledWith('id = :id', { id: 1 }); // Verificar cláusula where
            expect(executeMock).toHaveBeenCalled(); // Verificar ejecución del QueryBuilder
        });

        it('debería lanzar una excepción si el rol no existe', async () => {
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.update(1, {} as UpdateRoleDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('debería eliminar un rol y devolverlo', async () => {
            const mockRole = { id: 1, name: 'Admin', permissions: 8 } as Role;
            repository.findOneBy.mockResolvedValue(mockRole);
            repository.delete.mockResolvedValue(undefined);

            const result = await service.delete(1);
            expect(result).toEqual(mockRole);
            expect(repository.delete).toHaveBeenCalledWith({ id: 1 });
        });

        it('debería lanzar una excepción si el rol no existe', async () => {
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.delete(1)).rejects.toThrow(NotFoundException);
        });
    });
});

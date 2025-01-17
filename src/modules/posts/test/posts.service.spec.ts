import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from 'src/modules/posts/posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/common/models/post.entity';
import { PostStatus } from 'src/common/enums/PostStatus.enum';
import { NotFoundException } from '@nestjs/common';
import { PostOrderBy } from 'src/common/enums/PostOrderBy.enum';
import { PostOrderByOptions } from 'src/common/interfaces/post-order-by-options.interface';

const mockPostRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn(),
        getCount: jest.fn().mockResolvedValue(0),
        execute: jest.fn(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
    }),
};

describe('PostsService', () => {
    let service: PostsService;
    let repository: jest.Mocked<Repository<Post>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: getRepositoryToken(Post),
                    useValue: mockPostRepository,
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        repository = module.get(getRepositoryToken(Post));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('debería crear y guardar un post', async () => {
            const dto = {
                title: 'Test Post',
                content: 'Content',
                userId: 1,
                keywords: [],
            };
            const mockPost = {
                ...dto,
                id: 1,
                status: PostStatus.Active,
                createdAt: new Date(),
                lastUpdate: new Date(),
            };

            repository.save.mockResolvedValue(mockPost);

            const result = await service.create(dto);
            expect(result).toEqual(mockPost);
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
        });
    });

    describe('findOne', () => {
        it('debería devolver un post por su id', async () => {
            const mockPost = {
                id: 1,
                title: 'Test Post',
                content: 'Content',
                userId: 1,
                status: 1,
                keywords: [],
                createdAt: new Date(),
                lastUpdate: new Date(),
            };

            jest.spyOn(repository.createQueryBuilder(), 'getOne').mockResolvedValue(mockPost);

            const result = await service.findOne(1);
            expect(result).toEqual(mockPost);
            expect(repository.createQueryBuilder).toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si no encuentra un post', async () => {
            jest.spyOn(repository.createQueryBuilder(), 'getOne').mockResolvedValue(null);
            await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('debería eliminar (marcar como borrado) un post', async () => {
            const mockPost = {
                id: 1,
                title: 'Test Post',
                content: 'Content',
                userId: 1,
                status: 1,
                keywords: [],
                createdAt: new Date(),
                lastUpdate: new Date(),
            };

            jest.spyOn(repository.createQueryBuilder(), 'getOne').mockResolvedValue(mockPost);
            jest.spyOn(repository.createQueryBuilder(), 'execute').mockResolvedValue(undefined);

            const result = await service.delete(1);
            expect(result).toEqual(mockPost);
            expect(repository.createQueryBuilder).toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si no encuentra un post para eliminar', async () => {
            jest.spyOn(repository.createQueryBuilder(), 'getOne').mockResolvedValue(null);
            await expect(service.delete(99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('debería devolver una lista de posts', async () => {
            const mockPosts = [
                {
                    id: 1,
                    title: 'Test Post',
                    content: 'Content',
                    userId: 1,
                    status: 1,
                    keywords: [],
                    createdAt: new Date(),
                    lastUpdate: new Date(),
                },
                {
                    id: 2,
                    title: 'Test Post2',
                    content: 'Content2',
                    userId: 1,
                    status: 1,
                    keywords: [],
                    createdAt: new Date(),
                    lastUpdate: new Date(),
                },
            ];

            jest.spyOn(repository.createQueryBuilder(), 'getMany').mockResolvedValue(mockPosts);

            const pagination = { page: 1, limit: 10 };
            const result = await service.findAll(pagination);

            expect(result).toEqual(mockPosts);
            expect(repository.createQueryBuilder).toHaveBeenCalledWith('post');
            expect(repository.createQueryBuilder().skip).toHaveBeenCalledWith(0);
            expect(repository.createQueryBuilder().take).toHaveBeenCalledWith(10);
            expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
                'post.createdAt',
                'DESC',
            );
        });

        it('debería manejar errores al buscar todos los posts', async () => {
            jest.spyOn(repository.createQueryBuilder(), 'getMany').mockRejectedValue(
                new Error('Error interno'),
            );
            const pagination = { page: 1, limit: 10 };
            await expect(service.findAll(pagination)).rejects.toThrow(
                'Method or Function: PostsService/findAll\n\nError: Error interno',
            );
        });
    });

    describe('find', () => {
        it('debería devolver una lista de posts con filtros y orden', async () => {
            const mockPosts = [
                {
                    id: 1,
                    title: 'Test Post',
                    content: 'Content',
                    userId: 1,
                    status: 1,
                    keywords: [],
                    createdAt: new Date(),
                    lastUpdate: new Date(),
                },
                {
                    id: 2,
                    title: 'Test Post2',
                    content: 'Content2',
                    userId: 1,
                    status: 1,
                    keywords: [],
                    createdAt: new Date(),
                    lastUpdate: new Date(),
                },
            ];

            jest.spyOn(repository.createQueryBuilder(), 'getMany').mockResolvedValue(mockPosts);

            const filters = { status: PostStatus.Active };
            const pagination = { page: 1, limit: 10 };
            const order: PostOrderByOptions = { by: PostOrderBy.PostDate, order: 'DESC' };
            const result = await service.find(filters, pagination, order);

            expect(result).toEqual(mockPosts);
            expect(repository.createQueryBuilder).toHaveBeenCalledWith('post');
            expect(repository.createQueryBuilder().where).toHaveBeenCalledWith(
                'post.status = :status',
                { status: PostStatus.Active },
            );
            expect(repository.createQueryBuilder().skip).toHaveBeenCalledWith(0);
            expect(repository.createQueryBuilder().take).toHaveBeenCalledWith(10);
            expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
                'post.createdAt',
                'DESC',
            );
        });

        it('debería manejar errores al buscar posts con filtros', async () => {
            jest.spyOn(repository.createQueryBuilder(), 'getMany').mockRejectedValue(
                new Error('Error interno'),
            );
            const filters = { status: PostStatus.Active };
            const pagination = { page: 1, limit: 10 };
            const order: PostOrderByOptions = { by: PostOrderBy.PostDate, order: 'ASC' };
            await expect(service.find(filters, pagination, order)).rejects.toThrow(
                'Method or Function: PostsService/find\n\nError: Error interno',
            );
        });
    });
});

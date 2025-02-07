import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from 'src/modules/posts/posts.controller';
import { PostsService } from 'src/modules/posts/posts.service';
import { UsersService } from 'src/modules/users/users.service';
import { AuditLogsService } from 'src/modules/logs/audit-logs.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { PostFiltersDto } from 'src/common/validators/post-filters.dto';
import { Post } from 'src/common/models/post.entity';
import { User } from 'src/common/models/user.entity';
import { PostOrderBy } from 'src/common/enums/PostOrderBy.enum';
import { PostOrderByOptions } from 'src/common/interfaces/post-order-by-options.interface';
import { RolesService } from 'src/modules/roles/roles.service';

describe('PostsController', () => {
    let controller: PostsController;
    let postService: PostsService;
    let usersService: UsersService;
    let logsService: AuditLogsService;

    // Mock de las entidades
    const mockPost: Post = {
        id: 1,
        title: 'Test Post',
        shortDescription: 'Short description',
        userId: 1,
        status: 1,
        keywords: ['test', 'nestjs'],
        createdAt: new Date(),
        lastUpdate: new Date(),
        views: 0,
    };

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        status: 1,
        createdAt: new Date(),
        lastUpdate: new Date(),
        clearPassword: jest.fn().mockReturnThis(),
        roles: [],
    };

    const mockFiles: Express.Multer.File[] = [
        {
            buffer: Buffer.from('content'),
            mimetype: 'text/markdown',
            fieldname: 'test',
            originalname: 'teste',
            filename: 'teste',
            destination: 'teste',
            path: 'teste',
            size: 1024,
            stream: '' as any,
            encoding: 'UTF-8',
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostsController],
            providers: [
                {
                    provide: PostsService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockPost),
                        find: jest.fn().mockResolvedValue([mockPost]),
                        create: jest.fn().mockResolvedValue(mockPost),
                        update: jest.fn().mockResolvedValue(mockPost),
                        delete: jest.fn().mockResolvedValue(true),
                        count: jest.fn().mockResolvedValue(1),
                    },
                },
                {
                    provide: UsersService,
                    useValue: { findOne: jest.fn().mockResolvedValue(mockUser) },
                },
                {
                    provide: AuditLogsService,
                    useValue: { create: jest.fn().mockResolvedValue(true) },
                },
                {
                    provide: RolesService,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<PostsController>(PostsController);
        postService = module.get<PostsService>(PostsService);
        usersService = module.get<UsersService>(UsersService);
        logsService = module.get<AuditLogsService>(AuditLogsService);
    });

    describe('findPost', () => {
        it('debería devolver un post por id', async () => {
            const result = await controller.findPost(1);

            expect(result).toEqual({ post: mockPost });
            expect(postService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería lanzar NotFoundException si no se encuentra el post', async () => {
            jest.spyOn(postService, 'findOne').mockRejectedValue(
                new NotFoundException('Post not found'),
            );

            await expect(controller.findPost(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('find', () => {
        it('debería devolver los posts con filtros y paginación', async () => {
            const pagination = { page: 1, limit: 10 };
            const filters = {} as PostFiltersDto;
            const order: PostOrderByOptions = { by: PostOrderBy.PostDate, order: 'DESC' };

            const result = await controller.find(pagination, filters, order);

            expect(result).toEqual({ posts: [mockPost], count: 1 });
            expect(postService.find).toHaveBeenCalledWith(filters, pagination, order);
        });
    });

    describe('uploadFiles', () => {
        it('debería subir un nuevo post con archivos', async () => {
            const body = {
                title: 'Post Title',
                keywords: ['keyword'],
                shortDescription: 'Short description',
            };
            const mockContent = 'content'; // El contenido del archivo
            jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(postService, 'create').mockResolvedValue(mockPost);
            jest.spyOn(logsService, 'create').mockResolvedValue(null);

            // Simula que el archivo tiene el contenido adecuado
            mockFiles[0].buffer = Buffer.from(mockContent);

            const result = await controller.uploadFiles(mockFiles, body, { user: { userId: 1 } });

            expect(result).toEqual({ message: 'Post saved sucessfully!' });
            expect(postService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Post Title',
                    keywords: ['discord', 'bot', 'commands', 'keyword'],
                    content: mockContent,
                    userId: 1,
                }),
            );
        });

        it('debería lanzar BadRequestException si no se suben archivos', async () => {
            await expect(
                controller.uploadFiles(
                    [],
                    { title: 'Title', keywords: [], shortDescription: 'Short description' },
                    {},
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('debería lanzar NotFoundException si no se encuentra el post al actualizar', async () => {
            const body = {
                id: '1',
                title: 'Post Title',
                keywords: ['keyword'],
                shortDescription: 'Short description',
            };

            jest.spyOn(postService, 'findOne').mockResolvedValue(null);

            await expect(controller.uploadFiles(mockFiles, body, {})).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // describe('downloadPostContent', () => {
    //     it('debería devolver el contenido del post como archivo', async () => {
    //         const res: Partial<Response> = {
    //             setHeader: jest.fn(),
    //             send: jest.fn(),
    //             status: jest.fn(),
    //         };

    //         jest.spyOn(postService, 'findOne').mockResolvedValue(mockPost); // Simulamos que se encuentra el post

    //         await controller.downloadPostContent(1, res as Response);

    //         expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/markdown');
    //         expect(res.setHeader).toHaveBeenCalledWith(
    //             'Content-Disposition',
    //             'attachment; filename="Test Post.md"',
    //         );
    //         expect(res.send).toHaveBeenCalledWith(mockPost.content);
    //     });

    //     it('debería lanzar NotFoundException si el post no existe', async () => {
    //         jest.spyOn(postService, 'findOne').mockRejectedValue(
    //             new NotFoundException('Post not found'),
    //         );

    //         const res: Partial<Response> = {
    //             setHeader: jest.fn(),
    //             send: jest.fn(),
    //             status: jest.fn(),
    //         };

    //         await expect(controller.downloadPostContent(1, res as Response)).rejects.toThrow(
    //             NotFoundException,
    //         );
    //     });
    // });
});

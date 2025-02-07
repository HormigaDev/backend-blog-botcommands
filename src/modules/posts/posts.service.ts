import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostOrderBy } from 'src/common/enums/PostOrderBy.enum';
import { PostStatus } from 'src/common/enums/PostStatus.enum';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { PostFiltersDto } from 'src/common/validators/post-filters.dto';
import { PostOrderByOptions } from 'src/common/interfaces/post-order-by-options.interface';
import { ServiceInterface } from 'src/common/interfaces/service.interface';
import { Post } from 'src/common/models/post.entity';
import { UtilsService } from 'src/common/services/utils.service';
import { CreatePostDto } from 'src/common/validators/create-post.dto';
import { UpdatePostDto } from 'src/common/validators/update-post.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PostContent } from 'src/common/models/post-content.entity';
import { CreatePostContentDto } from 'src/common/validators/create-post-content.dto';
import { UpdatePostContentDto } from 'src/common/validators/update-post-content.dto';

@Injectable()
export class PostsService
    extends UtilsService<Post, UpdatePostDto>
    implements ServiceInterface<Post, CreatePostDto, UpdatePostDto>
{
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(PostContent)
        private readonly postContentRepository: Repository<PostContent>,
    ) {
        super(postRepository);
    }

    async create(dto: CreatePostDto): Promise<Post> {
        const manager = this.postRepository.manager;
        const queryRunner = manager.connection.createQueryRunner();

        await queryRunner.startTransaction();
        try {
            const post = new Post();
            post.title = dto.title;
            post.shortDescription = dto.shortDescription;
            post.userId = dto.userId;
            post.keywords = dto.keywords;
            post.status = PostStatus.Active;
            const savedPost = await queryRunner.manager.save(post);

            const postContent = new PostContent();
            postContent.identifier = dto.content.identifier;
            postContent.content = dto.content.content;
            postContent.postId = savedPost.id;

            await queryRunner.manager.save(postContent);
            await queryRunner.commitTransaction();

            const postWithContents = await queryRunner.manager
                .getRepository(Post)
                .createQueryBuilder('post')
                .leftJoinAndSelect('post.contents', 'postContent')
                .where('post.id = :id', { id: savedPost.id })
                .getOne();

            return postWithContents;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.handleError('PostsService/create', error);
        } finally {
            await queryRunner.release();
        }
    }

    async createPostContent(postId: number, dto: CreatePostContentDto): Promise<PostContent> {
        try {
            const post = await this.findOne(postId);
            const postContent = new PostContent();
            postContent.identifier = dto.identifier;
            postContent.content = dto.content;
            postContent.postId = post.id;

            return await this.postContentRepository.save(postContent);
        } catch (error) {
            this.handleError('PostsService/createPostContent', error);
        }
    }

    async findAll(pagination: PaginationInterface): Promise<Post[]> {
        try {
            return await this.postRepository
                .createQueryBuilder('post')
                .leftJoinAndSelect('post.contents', 'postContent')
                .skip(this.page(pagination))
                .take(pagination.limit)
                .orderBy('post.createdAt', 'DESC')
                .getMany();
        } catch (error) {
            this.handleError('PostsService/findAll', error);
        }
    }

    async find(
        filters: PostFiltersDto,
        pagination: PaginationInterface,
        order: PostOrderByOptions = { by: PostOrderBy.PostDate, order: 'DESC' },
    ): Promise<Post[] | number> {
        try {
            let query = this.postRepository
                .createQueryBuilder('post')
                .select()
                .leftJoinAndSelect('post.contents', 'postContent');
            if (filters.status) {
                query = query.where('post.status = :status', { status: filters.status });
            } else {
                query = query.where('post.status = :status', { status: PostStatus.Active });
            }

            query = this.applyDateFilters(filters, query);

            if (filters.query) {
                query = query.andWhere(
                    '(post.title like :query or post.content like :query or post.keywords @> :keywords)',
                    {
                        query: `%${filters.query}%`,
                        keywords: `[${JSON.stringify(filters.query)}]`,
                    },
                );
            }
            query = this.applyOrder(order, query);
            return await query.skip(this.page(pagination)).take(pagination.limit).getMany();
        } catch (error) {
            this.handleError('PostsService/find', error);
        }
    }

    async count(filters: PostFiltersDto) {
        try {
            let query = this.postRepository.createQueryBuilder('post').select();
            if (filters.status) {
                query = query.where('post.status = :status', { status: filters.status });
            } else {
                query = query.where('post.status = :status', { status: PostStatus.Active });
            }
            query = this.applyDateFilters(filters, query);
            if (filters.query) {
                query = query.andWhere(
                    '(post.title like :query or post.content like :query or post.keywords @> :keywords)',
                    {
                        query: `%${filters.query}%`,
                        keywords: `[${JSON.stringify(filters.query)}]`,
                    },
                );
            }
            const count = await query.getCount();
            return count;
        } catch (error) {
            this.handleError('PostsService/count', error);
        }
    }

    async findOne(id: number): Promise<Post> {
        try {
            const post = await this.postRepository
                .createQueryBuilder('post')
                .select()
                .leftJoinAndSelect('post.contents', 'postContent')
                .where('post.id = :id and post.status = :status', { id, status: PostStatus.Active })
                .getOne();
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            return post;
        } catch (error) {
            this.handleError('PostsService/findOne', error);
        }
    }

    async findPostContent(id: number): Promise<PostContent> {
        try {
            const postContent = await this.postContentRepository.findOneBy({ id });
            if (!postContent) {
                throw new NotFoundException('Post content not found');
            }

            return postContent;
        } catch (error) {
            this.handleError('PostsService/findPostContent', error);
        }
    }

    async update(id: number, dto: UpdatePostDto): Promise<Post> {
        try {
            const post = await this.findOne(id);
            await this.updateEntity(post.id, dto);
            return await this.findOne(id);
        } catch (error) {
            this.handleError('PostsService/update', error);
        }
    }

    async updatePostContent(
        postContentId: number,
        dto: UpdatePostContentDto,
    ): Promise<PostContent> {
        try {
            await this.findPostContent(postContentId);
            const props: Record<string, any> = {};
            if (dto.identifier) props.identifier = dto.identifier;
            if (dto.content) props.content = dto.content;
            await this.postContentRepository
                .createQueryBuilder()
                .update()
                .set(props)
                .where('id = :id', { id: postContentId })
                .execute();

            return await this.findPostContent(postContentId);
        } catch (error) {
            this.handleError('PostsService/updatePostContent', error);
        }
    }

    async archivePost(id: number): Promise<void> {
        try {
            const post = await this.findOne(id);
            await this.updateEntity(post.id, { status: PostStatus.Inactive });
        } catch (error) {
            this.handleError('PostsService/archivePost', error);
        }
    }

    async registerPostView(id: number): Promise<void> {
        await this.findOne(id);
        await this.postRepository
            .createQueryBuilder()
            .update()
            .set({ views: () => 'views + 1' })
            .where('id = :id', { id })
            .execute();
    }

    async delete(id: number): Promise<Post> {
        try {
            const post = await this.findOne(id);
            await this.postRepository
                .createQueryBuilder()
                .update()
                .set({ status: PostStatus.Deleted })
                .where('id = :id', { id })
                .execute();
            return post;
        } catch (error) {
            this.handleError('PostsService/delete', error);
        }
    }

    async restore(id: number): Promise<void> {
        try {
            const post = await this.findOne(id);
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            if (post.status !== PostStatus.Deleted) {
                throw new Error('Post is not deleted');
            }

            await this.postRepository
                .createQueryBuilder()
                .update()
                .set({ status: PostStatus.Active })
                .where('id = :id', { id })
                .execute();
        } catch (error) {
            this.handleError('PostsService/restore', error);
        }
    }

    private applyDateFilters(
        filters: PostFiltersDto,
        query: SelectQueryBuilder<Post>,
    ): SelectQueryBuilder<Post> {
        try {
            if (!filters.startDate) {
                filters.startDate = new Date(1900, 0, 1);
            }
            if (!filters.endDate) {
                filters.endDate = new Date(2100, 0, 1);
            } else {
                // Sumar un día al endDate
                const nextDay = new Date(filters.endDate);
                nextDay.setDate(nextDay.getDate() + 1);
                filters.endDate = nextDay;
            }
            return query.andWhere('post.createdAt >= :start AND post.createdAt < :end', {
                start: filters.startDate,
                end: filters.endDate,
            });
        } catch (error) {
            this.handleError('PostsService/applyDateFilters', error);
        }
    }

    private applyOrder(
        order: PostOrderByOptions,
        query: SelectQueryBuilder<Post>,
    ): SelectQueryBuilder<Post> {
        try {
            let orderField: string;
            switch (order.by) {
                case PostOrderBy.PostDate:
                    orderField = 'createdAt';
                    break;
                case PostOrderBy.PostTitle:
                    orderField = 'title';
                    break;
                case PostOrderBy.PostPopularity:
                    orderField = 'views';
                    break;
                default:
                    orderField = 'createdAt';
                    break;
            }
            return query.orderBy(`post.${orderField}`, order.order);
        } catch (error) {
            this.handleError('PostsService/applyOrder', error);
        }
    }
}

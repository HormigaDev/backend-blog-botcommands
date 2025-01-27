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

@Injectable()
export class PostsService
    extends UtilsService<Post, UpdatePostDto>
    implements ServiceInterface<Post, CreatePostDto, UpdatePostDto>
{
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
    ) {
        super(postRepository);
    }

    async create(dto: CreatePostDto): Promise<Post> {
        try {
            const post = new Post();
            post.title = dto.title;
            post.content = dto.content;
            post.shortDescription = dto.shortDescription;
            post.userId = dto.userId;
            post.keywords = dto.keywords;
            post.status = PostStatus.Active;

            return await this.postRepository.save(post);
        } catch (error) {
            this.handleError('create', error);
        }
    }

    async findAll(pagination: PaginationInterface): Promise<Post[]> {
        try {
            return await this.postRepository
                .createQueryBuilder('post')
                .select()
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

    async update(id: number, dto: UpdatePostDto): Promise<Post> {
        try {
            const post = await this.findOne(id);
            await this.updateEntity(post.id, dto);
            return await this.findOne(id);
        } catch (error) {
            this.handleError('PostsService/update', error);
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

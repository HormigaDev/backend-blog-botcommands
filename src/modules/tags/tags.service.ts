import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { ServiceInterface } from 'src/common/interfaces/service.interface';
import { Tag } from 'src/common/models/tag.entity';
import { UtilsService } from 'src/common/services/utils.service';
import { CreateTagDto } from 'src/common/validators/create-tag.dto';
import { UpdateTagDto } from 'src/common/validators/update-tag.dto';
import { Repository } from 'typeorm';

@Injectable()
export class TagsService
    extends UtilsService<Tag, UpdateTagDto>
    implements ServiceInterface<Tag, CreateTagDto, UpdateTagDto>
{
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) {
        super(tagRepository);
    }

    async create(dto: CreateTagDto): Promise<Tag> {
        try {
            const tag = new Tag();
            tag.name = dto.name;
            return await this.tagRepository.save(tag);
        } catch (error) {
            this.handleError('TagsService/create', error);
        }
    }

    async findByPost(id: number): Promise<Tag[]> {
        return this.tagRepository
            .createQueryBuilder('tag')
            .innerJoin('tag.posts', 'post')
            .where('post.id = :id', { id })
            .getMany();
    }

    async findOne(id: number): Promise<Tag> {
        try {
            const tag = await this.tagRepository.findOneBy({ id });
            if (!tag) {
                throw new NotFoundException('Tag not found');
            }
            return tag;
        } catch (error) {
            this.handleError('TagsService/findOne', error);
        }
    }

    async findAll(pagination: PaginationInterface): Promise<Tag[]> {
        try {
            const tags = await this.tagRepository
                .createQueryBuilder()
                .select()
                .skip(this.page(pagination))
                .take(pagination.limit)
                .getMany();

            return tags;
        } catch (error) {
            this.handleError('TagsService/findAll', error);
        }
    }

    async countAll(): Promise<number> {
        try {
            return await this.tagRepository.count();
        } catch (error) {
            this.handleError('TagsService/countAll', error);
        }
    }

    async update(id: number, dto: UpdateTagDto): Promise<Tag> {
        try {
            const tag = await this.findOne(id);
            await this.updateEntity(tag.id, dto);
            return await this.findOne(tag.id);
        } catch (error) {
            this.handleError('TagsService/update', error);
        }
    }

    async delete(id: number): Promise<Tag> {
        try {
            const tag = await this.findOne(id);
            await this.tagRepository.delete({ id });
            return tag;
        } catch (error) {
            this.handleError('TagsService/delete', error);
        }
    }
}

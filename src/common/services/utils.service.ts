import { BadRequestException, HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaginationInterface } from '../interfaces/pagination.interface';
import { CustomError } from '../types/CustomError.type';

export class UtilsService<T, T2> {
    private repository: Repository<T>;
    constructor(repository: Repository<T>) {
        this.repository = repository;
    }
    protected async updateEntity(id: number, dto: T2) {
        const props: Record<string, any> = {};
        for (const key of Object.keys(dto)) {
            if (dto[key] !== undefined) {
                props[key] = dto[key];
            }
        }

        if (Object.keys(props).length === 0) {
            throw new BadRequestException('No data to update');
        }

        await this.repository
            .createQueryBuilder()
            .update()
            .set(props)
            .where('id = :id', { id })
            .execute();
    }

    getRepository() {
        return this.repository;
    }

    page(pagination: PaginationInterface): number {
        return pagination.limit * (pagination.page - 1);
    }

    protected handleError(functionOrMethod: string, error: any): void {
        if (error instanceof HttpException) {
            throw error; // Dejar pasar excepciones HTTP tal cual
        } else {
            throw new CustomError({ functionOrMethod, error: error.message });
        }
    }
}

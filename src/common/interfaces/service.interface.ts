import { PaginationInterface } from './pagination.interface';

/**
 * T1: Type of the Entity
 * T2: Type of the DTO
 * T3: Type of Update DTO
 */

export interface ServiceInterface<T1, T2, T3> {
    create(dto: T2): Promise<T1>;
    findAll(pagination: PaginationInterface): Promise<T1[]>;
    findOne(id: number): Promise<T1>;
    update(id: number, dto: T3): Promise<T1>;
    delete(id: number): Promise<T1>;
}

import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { BadRequestException } from '@nestjs/common';

describe('PaginationPipe', () => {
    let pipe: PaginationPipe;

    beforeEach(() => {
        pipe = new PaginationPipe();
    });

    it('debería lanzar un BadRequestException si el valor no es un objeto', () => {
        expect(() => pipe.transform('invalid')).toThrow(BadRequestException);
    });

    it('debería lanzar un BadRequestException si "page" no es un número mayor que 0', () => {
        expect(() => pipe.transform({ page: 'a', limit: 10 })).toThrow(BadRequestException);
        expect(() => pipe.transform({ page: 0, limit: 10 })).toThrow(BadRequestException);
    });

    it('debería lanzar un BadRequestException si "limit" no es uno de los valores permitidos', () => {
        expect(() => pipe.transform({ page: 1, limit: 15 })).toThrow(BadRequestException);
    });

    it('debería devolver un objeto con "page" y "limit" como números', () => {
        const result = pipe.transform({ page: '2', limit: '20' });
        expect(result).toEqual({ page: 2, limit: 20 });
    });
});

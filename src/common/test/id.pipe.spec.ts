import { IdPipe } from 'src/common/pipes/id.pipe';
import { BadRequestException } from '@nestjs/common';

describe('IdPipe', () => {
    let pipe: IdPipe;

    beforeEach(() => {
        pipe = new IdPipe();
    });

    it('debería lanzar un BadRequestException si el valor no es un número', () => {
        expect(() => pipe.transform('abc')).toThrow(BadRequestException);
        expect(() => pipe.transform('')).toThrow(BadRequestException);
    });

    it('debería lanzar un BadRequestException si el valor no es un número positivo', () => {
        expect(() => pipe.transform('-1')).toThrow(BadRequestException);
        expect(() => pipe.transform('0')).toThrow(BadRequestException);
    });

    it('debería devolver el ID como un número si el valor es válido', () => {
        const result = pipe.transform('5');
        expect(result).toBe(5);
    });
});

import { JwtStrategy } from 'src/common/auth/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule],
            providers: [JwtStrategy],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('debería ser definido', () => {
        expect(strategy).toBeDefined();
    });

    it('debería extraer el JWT del cookie "auth_token"', () => {
        const req = { cookies: { auth_token: 'valid_token' } } as unknown as Request;
        const extractor = ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.auth_token]);
        const token = extractor(req);

        expect(token).toBe('valid_token');
    });

    it('debería lanzar UnauthorizedException si el payload es inválido', async () => {
        await expect(strategy.validate(null)).rejects.toThrow(UnauthorizedException);
    });

    it('debería devolver el usuario con id y username del payload', async () => {
        const payload = { sub: 1, username: 'testUser' };
        const result = await strategy.validate(payload);

        expect(result).toEqual({ userId: 1, username: 'testUser' });
    });
});

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('debería permitir el acceso si la ruta es pública', async () => {
        const context: ExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({}),
            }),
            getHandler: jest.fn(() => 'handler'),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(true);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('debería negar el acceso si la ruta no es pública y no está autenticado', async () => {
        const context: ExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { authorization: 'Bearer invalid_token' },
                }),
            }),
            getHandler: jest.fn(() => 'handler'),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(false);

        const canActivateSpy = jest.spyOn(guard, 'canActivate').mockResolvedValue(false);

        const result = await guard.canActivate(context);

        expect(result).toBe(false);
        expect(canActivateSpy).toHaveBeenCalled();
    });

    it('debería llamar a super.canActivate si la ruta no es pública', async () => {
        const context: ExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { authorization: 'Bearer valid_token' },
                }),
            }),
            getHandler: jest.fn(() => 'handler'),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(false);

        const canActivateSpy = jest.spyOn(guard, 'canActivate').mockImplementation(() => true);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(canActivateSpy).toHaveBeenCalled();
    });
});

import { IpWhitelistGuard } from '../guards/ip-whitelist.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('IpWhitelistGuard', () => {
    let guard: IpWhitelistGuard;
    let reflector: Reflector;

    beforeEach(() => {
        process.env.ALLOWED_IPS = '127.0.0.1 || 192.168.1.1';
        reflector = { get: jest.fn() } as any;
        guard = new IpWhitelistGuard(reflector);
    });

    it('debería permitir el acceso si la IP está en la lista blanca', () => {
        // Simulamos una IP permitida
        process.env.ALLOWED_IPS = '127.0.0.1||192.168.1.1';

        const request = { ip: '127.0.0.1' };
        const context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(false); // Aseguramos que no se permite excepciones por IPs no permitidas

        const result = guard.canActivate(context);

        expect(result).toBe(true); // El acceso debe ser permitido
    });

    it('debería permitir el acceso si la IP no está en la lista blanca y el handler tiene "nonIpWhitelisted" configurado', () => {
        // Simulamos una IP no permitida
        process.env.ALLOWED_IPS = '127.0.0.1||192.168.1.1';

        const request = { ip: '10.0.0.1' };
        const context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(true); // Permitimos el acceso debido a la configuración en el handler

        const result = guard.canActivate(context);

        expect(result).toBe(true); // El acceso debe ser permitido por la configuración
    });

    it('debería bloquear el acceso si la IP no está en la lista blanca y "nonIpWhitelisted" no está configurado', () => {
        // Simulamos una IP no permitida
        process.env.ALLOWED_IPS = '127.0.0.1||192.168.1.1';

        const request = { ip: '10.0.0.1' };
        const context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(false);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
});

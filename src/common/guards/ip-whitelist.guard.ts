import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
    private allowedIps: string[] =
        process.env.ALLOWED_IPS?.split('||').map((ip) => ip.trim()) || [];

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();
        const ip = request.ip;

        const isNonIpWhitelisted = this.reflector.get<boolean>(
            'nonIpWhitelisted',
            context.getHandler(),
        );

        if (isNonIpWhitelisted) {
            return true;
        }

        if (!this.allowedIps.includes(ip)) {
            throw new ForbiddenException('Access from this IP is not allowed');
        }

        return true;
    }
}

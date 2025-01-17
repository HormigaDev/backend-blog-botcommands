import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/modules/users/users.service';
import { UserStatus } from '../enums/UserStatus.enum';
import { RolesService } from 'src/modules/roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { permissions, optional } = this.reflector.get<{
            permissions: number[];
            optional: boolean;
        }>('permissions', context.getHandler()) || { permissions: [], optional: false };
        if (!permissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;

        if (!userId) {
            throw new ForbiddenException('User not found');
        }

        const user = await this.usersService.findOne(userId);
        if (user.status !== UserStatus.Active) {
            throw new ForbiddenException('User is not active');
        }

        const roles = await this.rolesService.findByUser(user.id);
        //si es opcional al menos debe cumplir con un permiso
        if (optional) {
            if (
                permissions.some((perm) => {
                    return roles.some((role) => {
                        return (role.permissions & perm) === perm;
                    });
                })
            ) {
                return true;
            } else {
                throw new ForbiddenException('Permission denied');
            }
            //si no es opcional debe cumplir con todos los permisos
        } else {
            if (
                permissions.every((perm) => {
                    return roles.some((role) => {
                        return (role.permissions & perm) === perm;
                    });
                })
            ) {
                return true;
            } else {
                throw new ForbiddenException('Permission denied');
            }
        }
    }
}

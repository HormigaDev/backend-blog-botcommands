import { SetMetadata } from '@nestjs/common';
import { Permissions } from '../enums/Permissions.enum';

export const RequirePermissions = (permissions: Permissions[], optional: boolean = false) =>
    SetMetadata('permissions', { permissions, optional });

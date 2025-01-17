import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesService } from './roles.service';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permissions } from 'src/common/enums/Permissions.enum';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { CreateRoleDto } from 'src/common/validators/create-role.dto';
import { UpdateRoleDto } from 'src/common/validators/update-role.dto';
import { IdPipe } from 'src/common/pipes/id.pipe';
import { AuditLogsService } from '../logs/audit-logs.service';
import { SqlAction } from 'src/common/enums/SqlAction.enum';

@Controller('roles')
@UseGuards(JwtAuthGuard)
@UseGuards(PermissionsGuard)
export class RolesController {
    constructor(
        private readonly rolesService: RolesService,
        private readonly logService: AuditLogsService,
    ) {}

    @Get('/all')
    @HttpCode(200)
    @RequirePermissions([Permissions.ReadRoles])
    async getRoles(@Query('pagination', PaginationPipe) pagination: PaginationInterface) {
        const roles = await this.rolesService.findAll(pagination);
        return { roles };
    }

    @Post('/role')
    @HttpCode(201)
    @RequirePermissions([Permissions.CreateRoles])
    async createRole(@Body() body: CreateRoleDto, @Req() req: any) {
        const role = await this.rolesService.create(body);
        await this.logService.create({
            details: JSON.stringify({
                old: null,
                new: role,
            }),
            operation: SqlAction.Insert,
            rowId: role.id,
            tableName: 'roles',
            userId: req.user?.userId,
        });

        return { role };
    }

    @Put('/role/:id')
    @HttpCode(204)
    @RequirePermissions([Permissions.UpdateRoles])
    async updateRole(
        @Body() body: UpdateRoleDto,
        @Param('id', IdPipe) id: number,
        @Req() req: any,
    ) {
        const oldRole = await this.rolesService.findOne(id);
        const newRole = await this.rolesService.update(id, body);
        await this.logService.create({
            details: JSON.stringify({
                old: oldRole,
                new: newRole,
            }),
            operation: SqlAction.Update,
            rowId: id,
            tableName: 'roles',
            userId: req.user?.userId,
        });

        return {};
    }

    @Delete('/role/:id')
    @HttpCode(204)
    @RequirePermissions([Permissions.DeleteRoles])
    async deleteRole(@Param('id', IdPipe) id: number, @Req() req: any) {
        const role = await this.rolesService.delete(id);
        await this.logService.create({
            details: JSON.stringify({
                old: role,
                new: null,
            }),
            operation: SqlAction.Delete,
            rowId: id,
            tableName: 'roles',
            userId: req.user?.userId,
        });

        return {};
    }
}

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
import { UsersService } from './users.service';
import { AuditLogsService } from '../logs/audit-logs.service';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permissions } from 'src/common/enums/Permissions.enum';
import { CreateUserDto } from 'src/common/validators/create-user.dto';
import { SqlAction } from 'src/common/enums/SqlAction.enum';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UpdateUserDto } from 'src/common/validators/update-user.dto';
import { IdPipe } from 'src/common/pipes/id.pipe';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { stringify } from 'flatted';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly logService: AuditLogsService,
    ) {}

    @Get('/all')
    @HttpCode(200)
    @RequirePermissions([Permissions.ReadUsers])
    @UseGuards(PermissionsGuard)
    async getUsers(@Query('pagination', PaginationPipe) pagination: PaginationInterface) {
        const users = (await this.usersService.findAll(pagination)).map((u) => u.clearPassword());
        const count = await this.usersService.countAll();

        return { users, count };
    }

    @Get('/userinfo/:id')
    @HttpCode(200)
    @RequirePermissions([Permissions.ReadUsers])
    @UseGuards(PermissionsGuard)
    async getUserInfo(@Param('id', IdPipe) id: number) {
        const user = (await this.usersService.findOne(id)).clearPassword();

        return { user };
    }

    @Get('/info/me')
    @HttpCode(200)
    async getInfo(@Req() req: any) {
        const id = req.user?.userId as number;
        const user = (await this.usersService.findOne(id)).clearPassword();

        return { user };
    }

    @Post('/create')
    @HttpCode(201)
    @RequirePermissions([Permissions.CreateUsers])
    @UseGuards(PermissionsGuard)
    async createUser(@Body() body: CreateUserDto, @Req() req: any) {
        const user = (await this.usersService.create(body)).clearPassword();
        await this.logService.create({
            operation: SqlAction.Insert,
            tableName: 'users',
            rowId: user.id,
            userId: req.user?.userId,
            details: stringify({
                old: null,
                new: user,
            }),
        });

        return { user };
    }

    @Put('/user/:id')
    @HttpCode(204)
    @RequirePermissions([Permissions.UpdateUsers])
    @UseGuards(PermissionsGuard)
    async updateUser(
        @Body() body: UpdateUserDto,
        @Param('id', IdPipe) id: number,
        @Req() req: any,
    ) {
        const oldUser = (await this.usersService.findOne(id)).clearPassword();
        const user = (await this.usersService.update(id, body)).clearPassword();

        await this.logService.create({
            details: stringify({
                old: oldUser,
                new: user,
            }),
            operation: SqlAction.Update,
            rowId: id,
            tableName: 'users',
            userId: req.user?.userId,
        });

        return {};
    }

    @Put('/update/self')
    @HttpCode(204)
    async updateSelf(@Body() body: UpdateUserDto, @Req() req: any) {
        delete body.status;
        const id = req.user?.userId as number;
        const oldUser = (await this.usersService.findOne(id)).clearPassword();
        const user = (await this.usersService.update(id, body)).clearPassword();

        await this.logService.create({
            details: stringify({
                old: oldUser,
                new: user,
            }),
            operation: SqlAction.Update,
            rowId: id,
            tableName: 'users',
            userId: id,
        });

        return {};
    }

    @Delete('/user/:id')
    @HttpCode(204)
    @RequirePermissions([Permissions.DeleteUsers])
    @UseGuards(PermissionsGuard)
    async deleteUser(@Param('id', IdPipe) id: number, @Req() req: any) {
        const user = (await this.usersService.delete(id)).clearPassword();
        await this.logService.create({
            details: stringify({
                old: user,
                new: null,
            }),
            operation: SqlAction.Delete,
            rowId: user.id,
            tableName: 'users',
            userId: req.user?.userId,
        });

        return {};
    }
}

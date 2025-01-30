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
    UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permissions } from 'src/common/enums/Permissions.enum';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { CreateTagDto } from 'src/common/validators/create-tag.dto';
import { UpdateTagDto } from 'src/common/validators/update-tag.dto';
import { IdPipe } from 'src/common/pipes/id.pipe';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
    constructor(private readonly tagService: TagsService) {}

    @Get('/all')
    @HttpCode(200)
    @RequirePermissions([Permissions.ReadTags])
    @UseGuards(PermissionsGuard)
    async getTags(@Query('pagination', PaginationPipe) pagination: PaginationInterface) {
        const tags = await this.tagService.findAll(pagination);
        const count = await this.tagService.countAll();

        return { tags, count };
    }

    @Post('/new')
    @HttpCode(201)
    @RequirePermissions([Permissions.CreateTags])
    @UseGuards(PermissionsGuard)
    async createTag(@Body() body: CreateTagDto) {
        const tag = await this.tagService.create(body);
        return { tag };
    }

    @Put('/tag/:id')
    @HttpCode(204)
    @RequirePermissions([Permissions.UpdateTags])
    @UseGuards(PermissionsGuard)
    async updateTag(@Param('id', IdPipe) id: number, @Body() body: UpdateTagDto) {
        await this.tagService.update(id, body);
        return {};
    }

    @Delete('/post/:id')
    @HttpCode(204)
    @RequirePermissions([Permissions.DeleteTags])
    @UseGuards(PermissionsGuard)
    async deleteTag(@Param('id', IdPipe) id: number) {
        await this.tagService.delete(id);
        return {};
    }
}

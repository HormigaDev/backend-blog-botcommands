import {
    Controller,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    Post as HttpPost,
    BadRequestException,
    UploadedFiles,
    Req,
    Body,
    Res,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { IdPipe } from 'src/common/pipes/id.pipe';
import { PostsService } from './posts.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { PostFiltersDto } from 'src/common/validators/post-filters.dto';
import { PostOrderByOptionsDto } from 'src/common/validators/post-order-by-options.dto';
import { Post } from 'src/common/models/post.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permissions } from 'src/common/enums/Permissions.enum';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UsersService } from '../users/users.service';
import { AuditLogsService } from '../logs/audit-logs.service';
import { SqlAction } from 'src/common/enums/SqlAction.enum';
import { UploadPostDto } from 'src/common/validators/upload-post.dto';
import { Response } from 'express';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
    constructor(
        private readonly postService: PostsService,
        private readonly usersService: UsersService,
        private readonly logsService: AuditLogsService,
    ) {}

    @Get('/post/:id')
    @HttpCode(200)
    @Public()
    async findPost(@Param('id', IdPipe) id: number) {
        const post = await this.postService.findOne(id);
        return { post };
    }

    @Get('/all')
    @HttpCode(200)
    @Public()
    async find(
        @Query('pagination', PaginationPipe) pagination: PaginationInterface,
        @Query('filters') filters: PostFiltersDto,
        @Query('order') order: PostOrderByOptionsDto,
    ) {
        const posts = (await this.postService.find(filters, pagination, order)) as Post[];
        const count = await this.postService.count(filters);

        return { posts, count };
    }

    @HttpPost('upload')
    @HttpCode(201)
    @RequirePermissions([Permissions.CreatePosts, Permissions.UpdatePosts], true)
    @UseGuards(PermissionsGuard)
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            fileFilter: (_, file, callback) => {
                if (file.mimetype !== 'text/markdown') {
                    return callback(new BadRequestException('Only MD files are allowed'), false);
                }
                callback(null, true);
            },
        }),
    )
    async uploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: UploadPostDto,
        @Req() req: any,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }
        const { title, keywords } = body;
        const content = files[0].buffer.toString();
        const user = await this.usersService.findOne(req.user?.userId);

        if (body.id) {
            const oldPost = await this.postService.findOne(body.id);
            if (!oldPost) {
                throw new NotFoundException('Post for update not found');
            }
            const newPost = await this.postService.update(body.id, {
                content,
                userId: user.id,
                keywords: ['discord', 'bot', 'commands', ...keywords],
                title,
            });

            await this.logsService.create({
                details: JSON.stringify({
                    old: oldPost,
                    new: newPost,
                }),
                rowId: body.id,
                operation: SqlAction.Update,
                tableName: 'posts',
                userId: user.id,
            });
        } else {
            const post = await this.postService.create({
                content,
                userId: user.id,
                keywords: ['discord', 'bot', 'commands', ...keywords],
                title,
            });

            await this.logsService.create({
                details: JSON.stringify({
                    old: null,
                    new: post,
                }),
                tableName: 'posts',
                operation: SqlAction.Insert,
                rowId: post.id,
                userId: req.user?.userId,
            });
        }

        return {
            message: 'Post saved sucessfully!',
        };
    }

    @Get('/download/:id')
    @HttpCode(200)
    @RequirePermissions([Permissions.UpdatePosts])
    @UseGuards(PermissionsGuard)
    async downloadPostContent(@Param('id', IdPipe) id: number, @Res() res: Response) {
        const post = await this.postService.findOne(id);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${post.title}.md"`);

        res.send(post.content);
    }
}

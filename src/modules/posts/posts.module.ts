import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/common/models/post.entity';
import { PostContent } from 'src/common/models/post-content.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Post, PostContent])],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}

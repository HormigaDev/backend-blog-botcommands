import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './common/auth/jwt.strategy';
import * as dotenv from 'dotenv';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LogsModule } from './modules/logs/logs.module';
import { RolesModule } from './modules/roles/roles.module';
import { PostsModule } from './modules/posts/posts.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exception.filter';
import { TagsModule } from './modules/tags/tags.module';

dotenv.config();

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            autoLoadEntities: true,
        }),
        UsersModule,
        AuthModule,
        LogsModule,
        RolesModule,
        PostsModule,
        TagsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        JwtStrategy,
        JwtAuthGuard,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors({
        credentials: true,
        origin: process.env.ORIGIN_CORS,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: false,
            forbidNonWhitelisted: false,
        }),
    );

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

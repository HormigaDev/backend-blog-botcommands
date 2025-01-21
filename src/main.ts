import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    if (process.env.NODE_ENV === 'development') {
        app.enableCors();
    }
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

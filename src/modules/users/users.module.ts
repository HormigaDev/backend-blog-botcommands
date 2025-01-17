import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/models/user.entity';
import { AuthController } from './auth.controller';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User]), AuthModule],
    controllers: [UsersController, AuthController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}

import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Put,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from 'src/common/validators/login.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdatePasswordDto } from 'src/common/validators/update-password.dto';
import { AuditLogsService } from '../logs/audit-logs.service';
import { SqlAction } from 'src/common/enums/SqlAction.enum';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly logService: AuditLogsService,
    ) {}

    @Post('login')
    @HttpCode(200)
    async login(@Body() body: LoginDto, @Res() res: Response) {
        const user = await this.usersService.findOneByEmail(body.email);
        if (await this.authService.passwordIsEqual(body.password, user.password)) {
            const token = await this.authService.generateToken({
                sub: user.id,
                username: user.name,
            });

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 4 * 60 * 60 * 1000,
            });

            return res.status(200).json({
                message: 'Login successful',
            });
        } else {
            throw new UnauthorizedException('Invalid Credentials');
        }
    }

    @Get('/authenticated')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async isAuthenticated() {
        return { message: 'IS AUTHENTICATED' };
    }

    @Post('logout')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async logout(@Res() res: Response) {
        res.clearCookie('auth_token');
        return res.status(200).json({
            message: 'Logout successful',
        });
    }

    @Put('/update/password')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async updatePassword(@Body() body: UpdatePasswordDto, @Req() req: any) {
        const id = req.user?.userId as number;
        const user = await this.usersService.findOne(id);
        const passwordIsEqual = await this.authService.passwordIsEqual(
            body.prevPassword,
            user.password,
        );
        if (passwordIsEqual) {
            await this.usersService.updatePassword(id, body.newPassword);
            await this.logService.create({
                details: JSON.stringify({
                    old: 'password',
                    new: 'password',
                }),
                operation: SqlAction.Update,
                rowId: id,
                tableName: 'users',
                userId: id,
            });

            return {};
        } else {
            throw new UnauthorizedException('Invalid previus password');
        }
    }
}

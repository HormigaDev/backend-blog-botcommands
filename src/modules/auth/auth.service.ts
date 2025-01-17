import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, +process.env.HASH_SALT);
    }

    async passwordIsEqual(prevPassword: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(prevPassword, passwordHash);
    }

    async generateToken(payload: any): Promise<string> {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    }

    async decodeToken(token: string): Promise<any> {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}

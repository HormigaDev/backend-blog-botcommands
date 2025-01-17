import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    describe('hashPassword', () => {
        it('debería hash el password correctamente', async () => {
            const password = '123456';
            const hashedPassword = 'hashed_password';

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const result = await authService.hashPassword(password);

            expect(result).toBe(hashedPassword);
            expect(bcrypt.hash).toHaveBeenCalledWith(password, parseInt(process.env.HASH_SALT));
        });
    });

    describe('passwordIsEqual', () => {
        it('debería devolver true si las contraseñas coinciden', async () => {
            const prevPassword = '123456';
            const passwordHash = 'hashed_password';

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.passwordIsEqual(prevPassword, passwordHash);

            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith(prevPassword, passwordHash);
        });

        it('debería devolver false si las contraseñas no coinciden', async () => {
            const prevPassword = '123456';
            const passwordHash = 'hashed_password';

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await authService.passwordIsEqual(prevPassword, passwordHash);

            expect(result).toBe(false);
            expect(bcrypt.compare).toHaveBeenCalledWith(prevPassword, passwordHash);
        });
    });

    describe('generateToken', () => {
        it('debería generar un token correctamente', async () => {
            const payload = { userId: 1 };
            const token = 'generated_token';

            (jwt.sign as jest.Mock).mockReturnValue(token);

            const result = await authService.generateToken(payload);

            expect(result).toBe(token);
            expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.JWT_SECRET, {
                expiresIn: '1d',
            });
        });
    });

    describe('decodeToken', () => {
        it('debería decodificar el token correctamente', async () => {
            const token = 'valid_token';
            const decodedPayload = { userId: 1 };

            (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

            const result = await authService.decodeToken(token);

            expect(result).toBe(decodedPayload);
            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
        });

        it('debería lanzar un error si el token es inválido', async () => {
            const token = 'invalid_token';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(authService.decodeToken(token)).rejects.toThrowError('Invalid token');
            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
        });
    });
});

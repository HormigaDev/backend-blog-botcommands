import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';

export class LoginDto {
    /**
     * The email address of the user.
     * It must be a non-empty string with a valid email format.
     */
    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Email must be a valid email address.' })
    readonly email: string;

    /**
     * The password of the user.
     * It must be a non-empty string with a minimum length of 8 characters.
     */
    @IsNotEmpty({ message: 'Password is required.' })
    @IsString({ message: 'Password must be a string.' })
    @Length(8, 100, { message: 'Password must be at least 8 characters long.' })
    readonly password: string;
}

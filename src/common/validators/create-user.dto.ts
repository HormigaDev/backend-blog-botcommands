import { IsNotEmpty, IsString, IsEmail, Length, Matches } from 'class-validator';

export class CreateUserDto {
    /**
     * The user's name.
     * It must be a non-empty string with a length between 3 and 50 characters.
     */
    @IsNotEmpty({ message: 'Name is required.' })
    @IsString({ message: 'Name must be a string.' })
    @Length(3, 255, { message: 'Name must be between 3 and 50 characters long.' })
    readonly name: string;

    /**
     * The user's email address.
     * It must have a valid email format.
     */
    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Email must be a valid email address.' })
    readonly email: string;

    /**
     * The user's password.
     * It must be a string with at least 8 characters.
     * It should include at least one uppercase letter, one lowercase letter, one number, and one special character.
     */
    @IsNotEmpty({ message: 'Password is required.' })
    @IsString({ message: 'Password must be a string.' })
    @Length(12, 100, { message: 'Password must be at least 8 characters long.' })
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, {
        message:
            'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    })
    readonly password: string;
}

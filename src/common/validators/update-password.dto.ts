import { IsString, Matches, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    /**
     * The previous password of the user.
     * It must be a string if provided.
     * It is required.
     */
    @IsString({ message: 'Previous password must be a string.' })
    readonly prevPassword: string;

    /**
     * The new password of the user.
     * It must be a string if provided.
     * It is required.
     * It must have a minimum length of 12 characters.
     * It should contain at least one uppercase letter, one lowercase letter, one number, and one special character.
     */
    @IsString({ message: 'New password must be a string.' })
    @MinLength(12, { message: 'New password must be at least 12 characters long.' })
    @Matches(/(?=.*[A-Z])/, {
        message: 'New password must contain at least one uppercase letter.',
    })
    @Matches(/(?=.*[a-z])/, {
        message: 'New password must contain at least one lowercase letter.',
    })
    @Matches(/(?=.*\d)/, {
        message: 'New password must contain at least one number.',
    })
    @Matches(/(?=.*[@$!%*?&])/, {
        message: 'New password must contain at least one special character.',
    })
    readonly newPassword: string;
}

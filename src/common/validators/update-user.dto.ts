import { IsOptional, IsString, IsEmail, Length, IsEnum } from 'class-validator';
import { UserStatus } from '../enums/UserStatus.enum';

export class UpdateUserDto {
    /**
     * The user's name.
     * It must be a string if provided.
     * It is optional for updates.
     */
    @IsOptional()
    @IsString({ message: 'Name must be a string.' })
    @Length(3, 255, { message: 'Name must be between 3 and 50 characters long.' })
    readonly name?: string;

    /**
     * The user's email.
     * It must be a valid email format if provided.
     * It is optional for updates.
     */
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address.' })
    readonly email?: string;

    /**
     * The user's status.
     * It must be a valid status if provided.
     * It is optional for updates.
     */
    @IsOptional()
    @IsEnum(UserStatus, { message: 'Status must be one of the valid user statuses.' })
    status?: UserStatus;
}

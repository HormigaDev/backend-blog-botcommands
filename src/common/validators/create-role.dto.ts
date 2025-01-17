import { IsNotEmpty, IsString, IsNumber, Length } from 'class-validator';

export class CreateRoleDto {
    /**
     * The name of the role.
     * It must be a non-empty string with a length between 3 and 255 characters.
     */
    @IsNotEmpty({ message: 'Role name is required.' })
    @IsString({ message: 'Role name must be a string.' })
    @Length(3, 255, { message: 'Role name must be between 3 and 255 characters long.' })
    readonly name: string;

    /**
     * The permissions associated with the role.
     * It must be a non-empty number.
     */
    @IsNotEmpty({ message: 'Permissions are required.' })
    @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Permissions must be a valid number.' })
    readonly permissions: number;
}

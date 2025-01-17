import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRoleDto {
    /**
     * The name of the role.
     * It must be a string if provided.
     * It is optional.
     */
    @IsOptional()
    @IsString({ message: 'Role name must be a string.' })
    readonly name?: string;

    /**
     * The permissions associated with the role.
     * It must be a number if provided.
     * It is optional.
     */
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Permissions must be a valid number.' })
    readonly permissions?: number;
}

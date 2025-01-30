import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateTagDto {
    /**
     * The name of the tag.
     * It must be a string if provided.
     * It is optional.
     */
    @IsOptional()
    @IsString({ message: 'Tag name must be a string.' })
    @Length(3, 100, { message: 'Tag name must be between 3 and 100 characters long.' })
    readonly name?: string;
}

import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateTagDto {
    /**
     * The name of the tag.
     * It must be a non-empty string with a length between 3 and 100 characters.
     */
    @IsNotEmpty({ message: 'Tag name is required.' })
    @IsString({ message: 'Tag name must be a string.' })
    @Length(3, 100, { message: 'Tag name must be between 3 and 100 characters long.' })
    @Matches(/^[a-zA-Z0-9]$/, { message: 'Tag must be an alphanumeric string' })
    readonly name: string;
}

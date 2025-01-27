import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, Length } from 'class-validator';

export class UploadPostDto {
    /**
     * The title of the post.
     * It must be a non-empty string.
     */
    @IsNotEmpty({ message: 'Title is required.' })
    @IsString({ message: 'Title must be a string.' })
    @Length(3, 255, { message: 'Title must be between 1 and 255 characters long.' })
    readonly title: string;

    /**
     * The short description of the post.
     * It must be a non-empty string.
     */
    @IsNotEmpty({ message: 'Title is required.' })
    @IsString({ message: 'Title must be a string.' })
    @Length(50, 300, {
        message: 'Short description must be a between 50 and 300 characters long.',
    })
    readonly shortDescription: string;

    /**
     * The keywords associated with the post.
     * It must be a non-empty array of strings.
     */
    @IsNotEmpty({ message: 'Keywords are required.' })
    @IsArray({ message: 'Keywords must be an array of strings.' })
    @IsString({ each: true, message: 'Each keyword must be a string.' })
    readonly keywords: string[];

    /**
     * The post ID.
     * It is optional, and if provided, it must be a number.
     */
    @IsOptional()
    @IsNumber({}, { message: 'Post ID must be a number.' })
    readonly id?: number;

    /**
     * The files associated with the post.
     * It is optional, and if provided, it must be an array.
     */
    @IsOptional()
    @IsArray({ message: 'Files must be an array.' })
    readonly files?: any[];
}

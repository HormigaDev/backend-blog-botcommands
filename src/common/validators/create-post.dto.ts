import { IsNotEmpty, IsString, IsNumber, IsArray, Length } from 'class-validator';

export class CreatePostDto {
    /**
     * The title of the post.
     * It must be a non-empty string with a length between 3 and 255 characters (as per the database constraint).
     */
    @IsNotEmpty({ message: 'Title is required.' })
    @IsString({ message: 'Title must be a string.' })
    @Length(3, 255, { message: 'Title must be between 1 and 255 characters long.' })
    readonly title: string;

    /**
     * The short description of the post.
     * It must be a non-empty string.
     */
    @IsNotEmpty({ message: 'Short description is required.' })
    @IsString({ message: 'Short description must be a string.' })
    @Length(50, 300, {
        message: 'Short description must be a between 50 and 300 characters long.',
    })
    readonly shortDescription: string;

    /**
     * The content of the post.
     * It must be a non-empty string.
     */
    @IsNotEmpty({ message: 'Content is required.' })
    @IsString({ message: 'Content must be a string.' })
    readonly content: string;

    /**
     * The user ID associated with the post.
     * It must be a non-empty number.
     */
    @IsNotEmpty({ message: 'User ID is required.' })
    @IsNumber({}, { message: 'User ID must be a number.' })
    readonly userId: number;

    /**
     * The keywords associated with the post.
     * It must be an array of strings (optional).
     */
    @IsArray({ message: 'Keywords must be an array.' })
    @IsString({ each: true, message: 'Each keyword must be a string.' })
    readonly keywords: string[];
}

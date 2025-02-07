import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePostContentDto {
    /**
     * The identifier of the post content
     * It must be a non-empty string.
     */
    @IsNotEmpty({ message: 'Post identifier is required.' })
    @IsString({ message: 'Post identifier must be a string.' })
    @Length(1, 100, { message: 'Post identifier must be between 1 and 100 characters long.' })
    readonly identifier: string;

    /**
     * The content of the post.
     * It must be a non-empty string.
     */
    @IsNotEmpty({ message: 'Content is required.' })
    @IsString({ message: 'Content must be a string.' })
    readonly content: string;
}

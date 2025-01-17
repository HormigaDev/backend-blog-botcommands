import { IsOptional, IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { PostStatus } from '../enums/PostStatus.enum';

export class UpdatePostDto {
    /**
     * The title of the post.
     * It must be a string if provided.
     * It is optional.
     */
    @IsOptional()
    @IsString({ message: 'Title must be a string.' })
    readonly title?: string;

    /**
     * The content of the post.
     * It must be a string if provided.
     * It is optional.
     */
    @IsOptional()
    @IsString({ message: 'Content must be a string.' })
    readonly content?: string;

    /**
     * The user ID associated with the post.
     * It must be a number if provided.
     * It is optional.
     */
    @IsOptional()
    @IsNumber({}, { message: 'User ID must be a number.' })
    readonly userId?: number;

    /**
     * The keywords associated with the post.
     * It must be an array of strings if provided.
     * It is optional.
     */
    @IsOptional()
    @IsArray({ message: 'Keywords must be an array.' })
    @IsString({ each: true, message: 'Each keyword must be a string.' })
    readonly keywords?: string[];

    /**
     * The status of the post.
     * It must be a valid value from the PostStatus enum if provided.
     * It is optional.
     */
    @IsOptional()
    @IsEnum(PostStatus, { message: 'Status must be a valid value from the PostStatus enum.' })
    readonly status?: PostStatus;
}

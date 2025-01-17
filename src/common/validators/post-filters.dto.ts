import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '../enums/PostStatus.enum';

export class PostFiltersDto {
    /**
     * The start date for filtering posts.
     * It must be a valid date string (ISO 8601 format).
     */
    @IsOptional()
    @IsDateString({}, { message: 'Start date must be a valid date string (ISO 8601 format).' })
    startDate?: Date;

    /**
     * The end date for filtering posts.
     * It must be a valid date string (ISO 8601 format).
     */
    @IsOptional()
    @IsDateString({}, { message: 'End date must be a valid date string (ISO 8601 format).' })
    endDate?: Date;

    /**
     * The query string to filter posts by title or content.
     * It must be a string.
     */
    @IsOptional()
    @IsString({ message: 'Query must be a string.' })
    readonly query?: string;

    /**
     * The status of the post.
     * It must be one of the defined statuses in the PostStatus enum.
     */
    @IsOptional()
    @IsEnum(PostStatus, {
        message: `Status must be one of the following values: ${Object.values(PostStatus).join(', ')}`,
    })
    readonly status?: PostStatus;
}

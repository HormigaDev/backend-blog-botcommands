import { IsNotEmpty, IsEnum, IsString, IsIn } from 'class-validator';
import { PostOrderBy } from '../enums/PostOrderBy.enum';

export class PostOrderByOptionsDto {
    /**
     * The field by which to order the posts.
     * It must be a valid enum value from the PostOrderBy enum.
     */
    @IsNotEmpty({ message: 'Order by field is required.' })
    @IsEnum(PostOrderBy, { message: 'Order by must be a valid value from the PostOrderBy enum.' })
    readonly by: PostOrderBy;

    /**
     * The sorting direction for the posts.
     * It must be either 'ASC' (ascending) or 'DESC' (descending).
     */
    @IsNotEmpty({ message: 'Order direction is required.' })
    @IsString({ message: 'Order direction must be a string.' })
    @IsIn(['ASC', 'DESC'], { message: 'Order direction must be either "ASC" or "DESC".' })
    readonly order: 'ASC' | 'DESC';
}

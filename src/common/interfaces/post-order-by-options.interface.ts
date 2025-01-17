import { PostOrderBy } from '../enums/PostOrderBy.enum';

export interface PostOrderByOptions {
    by: PostOrderBy;
    order: 'ASC' | 'DESC';
}

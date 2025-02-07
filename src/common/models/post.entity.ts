import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PostStatus } from '../enums/PostStatus.enum';
import { PostContent } from './post-content.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    @Column({ name: 'short_description', type: 'varchar', length: 300 })
    shortDescription: string;

    @Column({ name: 'user_id', type: 'integer', nullable: false })
    userId: number;

    @Column({ name: 'status_id', type: 'integer', nullable: false })
    status: PostStatus;

    @Column({ type: 'jsonb', nullable: true })
    keywords: string[];

    @Column({ type: 'integer', default: 0 })
    views: number;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'last_update', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @OneToMany(() => PostContent, (postContent) => postContent.post)
    contents: PostContent[];
}

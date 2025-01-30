import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { PostStatus } from '../enums/PostStatus.enum';
import { Tag } from './tag.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    @Column({ name: 'short_description', type: 'varchar', length: 300 })
    shortDescription: string;

    @Column({ type: 'text', nullable: false })
    content: string;

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

    @ManyToMany(() => Tag, (tag) => tag.posts)
    @JoinTable({
        name: 'tag_posts',
        joinColumn: {
            name: 'tag_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'post_id',
            referencedColumnName: 'id',
        },
    })
    tags: Tag[];
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PostStatus } from '../enums/PostStatus.enum';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    @Column({ type: 'text', nullable: false })
    content: string;

    @Column({ name: 'user_id', type: 'integer', nullable: false })
    userId: number;

    @Column({ name: 'status_id', type: 'integer', nullable: false })
    status: PostStatus;

    @Column({ type: 'jsonb', nullable: true })
    keywords: string[];

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'last_update', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;
}

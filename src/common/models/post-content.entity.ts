import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_contents')
export class PostContent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    identifier: string;

    @Column({ type: 'text', nullable: false })
    content: string;

    @Column({ name: 'post_id', type: 'integer', nullable: false })
    postId: number;

    @ManyToOne(() => Post, (post) => post.contents)
    @JoinColumn({ name: 'post_id' })
    post: Post;
}

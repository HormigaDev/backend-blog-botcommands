import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserStatus } from '../enums/UserStatus.enum';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'text' })
    password: string;

    @Column({ name: 'username', type: 'varchar', length: 255 })
    name: string;

    @Column({ name: 'status_id', type: 'integer', default: () => 1 })
    status: UserStatus;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'last_update', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    clearPassword() {
        delete this.password;
        return this;
    }
}

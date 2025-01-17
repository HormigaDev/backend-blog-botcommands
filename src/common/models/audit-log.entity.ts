import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { SqlAction } from '../enums/SqlAction.enum';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'table_name', type: 'varchar', length: 255 })
    tableName: string;

    @Column({ name: 'row_id', type: 'integer' })
    rowId: number;

    @Column({ name: 'user_id', type: 'integer', nullable: false })
    userId: number;

    @Column({ type: 'varchar', length: 255 })
    operation: SqlAction;

    @Column({ name: 'log_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    logDate: Date;

    @Column({ type: 'text' })
    details: string;
}

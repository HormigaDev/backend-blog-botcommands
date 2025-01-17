import { SqlAction } from '../enums/SqlAction.enum';

export interface AuditLogInterface {
    tableName: string;
    rowId: number;
    userId: number;
    operation: SqlAction;
    details: string;
    logDate?: Date;
}

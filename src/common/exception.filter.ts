import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuditLogsService } from 'src/modules/logs/audit-logs.service';
import { CustomError } from './types/CustomError.type';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logService: AuditLogsService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        if (!(exception instanceof HttpException)) {
            console.log(exception);
        }

        const message =
            exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}

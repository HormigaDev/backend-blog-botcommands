import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PaginationPipe implements PipeTransform {
    transform(value: any) {
        if (typeof value !== 'object' || value === null) {
            throw new BadRequestException('Pagination must be an object');
        }

        const { page, limit } = value;

        if (!Number.isInteger(+page) || +page <= 0) {
            throw new BadRequestException('Page must be a number greater than 0');
        }

        const allowedLimits = [3, 10, 20, 30, 50, 100];
        if (!allowedLimits.includes(+limit)) {
            throw new BadRequestException(
                `Limit must be a one of the following values: ${allowedLimits.join(', ')}`,
            );
        }

        return {
            page: +page,
            limit: +limit,
        };
    }
}

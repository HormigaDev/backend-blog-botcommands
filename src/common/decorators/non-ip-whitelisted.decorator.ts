import { SetMetadata } from '@nestjs/common';

export const NonIpWhitelisted = () => SetMetadata('nonIpWhitelisted', true);

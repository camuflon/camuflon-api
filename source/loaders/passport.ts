import { Express } from 'express';
import logger from '@/utils/logger';
import { initializePassport } from '@/utils/auth';

export default function loadPassport(app: Express): void {
    logger.debug('Load passport');
    app.use(initializePassport());
}

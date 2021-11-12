import { Express } from 'express';
import logger from '@/utils/logger';
// import { initializePassport, initializeSession } from '@/utils/auth';

export default function loadPassport(app: Express): void {
    logger.debug('Load passport');
    // app.use(initializePassport());
    logger.debug('Load passport session');
    // app.use(initializeSession());
}

import { Router } from 'express';
import logger from '@/utils/logger';

import authRouter from './routes/auth/auth.route';
import companiesRouter from './routes/companies/companies.route';
import versionRouter from './routes/version/version.route';

export default function (): Router {
    const router = Router();

    logger.debug('/auth');
    router.use('/auth', authRouter());

    logger.debug('/companies');
    router.use('/companies', companiesRouter());

    logger.debug('/version');
    router.use('/version', versionRouter());

    return router;
}

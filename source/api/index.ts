import { Router } from 'express';
import logger from '@/utils/logger';

import companiesRouter from './routes/companies/companies.route';
import versionRouter from './routes/version/version.route';

export default function (): Router {
    const router = Router();

    logger.debug('/companies');
    router.use('/companies', companiesRouter());

    logger.debug('/version');
    router.use('/version', versionRouter());

    return router;
}

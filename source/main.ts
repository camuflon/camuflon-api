import './utils/moduleAlias';

import express from 'express';
// import { Loader } from '@/loaders';
// import router from '@/api';
import logger from '@/utils/logger';
import CONFIG from '@/config';

async function startServer(): Promise<void> {
    logger.hr();
    logger.warning('CAMUFLON API');

    const app = express();

    // const loader = new Loader(app, router);
    // loader.loadMiddlewares();
    // loader.loadRouter();
    // loader.loadErrorHandler();
    // loader.loadSubscribers();
    // await loader.loadJobs();
    // await loader.testDatabaseConnection();

    logger.info('Starting server...');
    const port = CONFIG.SERVER.PORT;
    app.listen(port, () => {
        logger.success(`Server listening on port ${port}`);
        logger.hr();
    });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer();

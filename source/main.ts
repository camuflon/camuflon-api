import './utils/moduleAlias';

import express from 'express';
import { Loader } from '@/loaders';
import router from '@/api';
import logger from '@/utils/logger';
import CONFIG from '@/config';

function startServer(): void {
    logger.hr();
    logger.warning('CAMUFLON API');

    const app = express();

    const loader = new Loader(app, router);
    loader.loadMiddlewares();
    loader.loadRouter();
    loader.loadErrorHandler();

    logger.info('Starting server...');
    const port = CONFIG.SERVER.PORT;
    app.listen(port, () => {
        logger.success(`Server listening on port ${port}`);
        logger.hr();
    });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer();

import dotenv from 'dotenv';
import path from 'path';

declare const process: {
    env: Record<string, string>;
    cwd: () => string;
};

const packageJson = require(path.join(process.cwd(), 'package.json'));

dotenv.config({
    path: path.join(process.cwd(), '.env')
});

const CONFIG = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    SERVER: {
        PORT: process.env.SERVER_PORT || 3000,
        URL: process.env.SERVER_URL
    },
    LOGGER: {
        DEBUG: process.env.LOGGER_DEBUG === 'true'
    },
    API_VERSION: packageJson.version
};

export default CONFIG;

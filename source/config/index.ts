import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

declare const process: {
    env: Record<string, string>;
    cwd: () => string;
};

const packageJson = require(path.join(process.cwd(), 'package.json'));

dotenv.config({
    path: path.join(process.cwd(), '.env')
});

function getPath(address: string): string {
    return path.join(process.cwd(), address);
}

function fileContent(path: string): string {
    return fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : '';
}

const CONFIG = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    SERVER: {
        PORT: process.env.PORT || process.env.SERVER_PORT || 3000,
        URL: process.env.SERVER_URL
    },
    MONGO: {
        URI: process.env.MONGO_URI,
        DB: process.env.MONGO_DB
    },
    SECURITY: {
        SALT_ROUNDS: +process.env.SECURITY_SALT_ROUNDS,
        JWT: {
            ALGORITHM: process.env.SECURITY_JWT_ALGORITHM,
            PRIVATE_PASSWORD_PATH: getPath(process.env.SECURITY_JWT_PRIVATE_PASSWORD_PATH),
            PUBLIC_PASSWORD_PATH: getPath(process.env.SECURITY_JWT_PUBLIC_PASSWORD_PATH),
            PRIVATE_PASSWORD: fileContent(getPath(process.env.SECURITY_JWT_PRIVATE_PASSWORD_PATH)),
            PUBLIC_PASSWORD: fileContent(getPath(process.env.SECURITY_JWT_PUBLIC_PASSWORD_PATH)),
            EXPIRATION: process.env.SECURITY_JWT_EXPIRATION,
            ISSUER: process.env.SECURITY_JWT_ISSUER
        }
    },
    EMAIL: {
        TYPE: process.env.EMAIL_TYPE,
        USER: process.env.EMAIL_USER,
        CLIENT_ID: process.env.EMAIL_CLIENT_ID,
        CLIENT_SECRET: process.env.EMAIL_CLIENT_SECRET,
        REFRESH_TOKEN: process.env.EMAIL_REFRESH_TOKEN,
        ACCESS_TOKEN: process.env.EMAIL_ACCESS_TOKEN,
        EXPIRES: process.env.EMAIL_EXPIRES,
        TEMPLATES_PATH: getPath(process.env.EMAIL_TEMPLATES_PATH)
    },
    LOGGER: {
        DEBUG: process.env.LOGGER_DEBUG === 'true'
    },
    API_VERSION: packageJson.version
};

export default CONFIG;

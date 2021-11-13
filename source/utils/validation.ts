import Joi from 'joi';

import logger from '@/utils/logger';
import { ObjectId } from '@/services/db.service';
import { InvalidBodyError, InvalidIdError } from '@/errors';

export function validateBody<ResultType>(schema: Joi.Schema, body: any): ResultType {
    const result = schema.validate(body);

    if (result.error) {
        const description = result.error.message;
        logger.warning('Validation error', description);
        throw new InvalidBodyError(undefined, description);
    }

    return result.value;
}

export function validateMongoId(id: string): ObjectId {
    if (!id) {
        throw new InvalidIdError('Id not provided');
    }

    try {
        return new ObjectId(id);
    } catch (error) {
        logger.warning('Invalid id', error);
        throw new InvalidIdError();
    }
}

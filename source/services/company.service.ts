import bcrypt from 'bcrypt';
import Joi from 'joi';
import { v4 as uuid } from 'uuid';

import { dbQuery, ObjectId } from '@/services/db.service';
import authService, { AuthResponse } from '@/services/auth.service';
import emailService from '@/services/email.service';

import { validateBody, validateMongoId } from '@/utils/validation';
import logger from '@/utils/logger';

import { Company } from '@/types';
import { InvalidBodyError } from '@/errors';

import CONFIG from '@/config';

type CompanyCreateBody = Pick<Company, 'name' | 'email' | 'password'>;
type CompanyEditBody = Pick<Company, 'name' | 'email'>;

export class CompanyService {
    protected readonly postValidator = Joi.object({
        name: Joi.string()
            .min(1)
            .regex(/^[\w.]+$/),
        email: Joi.string().email(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]{8,32}$/)
    })
        .required()
        .options({ presence: 'required' });

    protected readonly patchValidator = Joi.object({
        name: Joi.string()
            .min(1)
            .regex(/^[\w.]+$/),
        email: Joi.string().email()
    })
        .required()
        .options({ presence: 'optional' });

    private hashPassword(password: string): string {
        return bcrypt.hashSync(password, CONFIG.SECURITY.SALT_ROUNDS);
    }

    public async postCompany(body: any): Promise<AuthResponse> {
        const parsedBody = validateBody<CompanyCreateBody>(this.postValidator, body);

        const company = {
            name: parsedBody.name,
            email: parsedBody.email,
            token: uuid(),
            password: this.hashPassword(parsedBody.password),
            beaconsUUID: null
        };

        const id = await dbQuery<ObjectId>(async db => {
            const alreadyExists = await db.collection('companies').countDocuments({
                $or: [{ email: company.email }, { name: company.name }]
            });

            if (alreadyExists) {
                throw new InvalidBodyError(
                    'Company already exists',
                    'There is already a company with this name or email'
                );
            }

            const result = await db.collection<Company>('companies').insertOne(company);
            return result.insertedId;
        });

        emailService
            .newUser(company as any)
            .then(() => logger.info('Email sent'))
            .catch(error => logger.error(error));

        return authService.generateAuthResponse({
            ...company,
            _id: id
        });
    }

    public async patchCompany(id: string, body: any): Promise<void> {
        const parsedId = validateMongoId(id);
        const parsedBody = validateBody<CompanyEditBody>(this.patchValidator, body);

        await dbQuery(async db => {
            const alreadyExists = await db.collection('companies').countDocuments({
                $or: [
                    { email: parsedBody.email, _id: { $ne: parsedId } },
                    { name: parsedBody.name, _id: { $ne: parsedId } }
                ]
            });

            if (alreadyExists) {
                throw new InvalidBodyError(
                    'Company already exists',
                    'There is already another company with this name or email'
                );
            }

            const result = await db.collection<Company>('companies').updateOne({ _id: parsedId }, { $set: parsedBody });
            if (!result.matchedCount) {
                throw new Error('Error in updating the company on the db');
            }
        });
    }
}

export default new CompanyService();

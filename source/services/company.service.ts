import bcrypt from 'bcrypt';
import Joi from 'joi';
import { v4 as uuid } from 'uuid';

import { dbQuery, ObjectId } from '@/services/db.service';
import authService, { AuthResponse } from '@/services/auth.service';

import { validateBody } from '@/utils/validation';

import { Company } from '@/types';

import CONFIG from '@/config';
import { InvalidBodyError } from '@/errors';

type CompanyCreateBody = Pick<Company, 'name' | 'email' | 'password'>;

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

        return authService.generateAuthResponse({
            ...company,
            _id: id
        });
    }
}

export default new CompanyService();

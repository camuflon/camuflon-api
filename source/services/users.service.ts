import Joi from 'joi';

import { dbQuery, ObjectId } from '@/services/db.service';

import { validateBody, validateMongoId } from '@/utils/validation';
import { Company, Statistic, User } from '@/types';
import { InvalidBodyError, InvalidTokenError } from '@/errors';

interface UsersPutBody {
    companyName: string;
    token: string;
    userId?: string | null;
}
interface UsersPutResponse {
    companyId: string;
    companyName: string;
    userId: string;
}
interface UsersGetBody {
    companyName: string;
    token: string;
}

export class UsersService {
    protected readonly putValidator = Joi.object({
        companyName: Joi.string().regex(/^[\w.]+$/),
        token: Joi.string().min(1),
        userId: Joi.string().length(24).allow(null).optional().default(null)
    })
        .required()
        .options({ presence: 'required' });

    protected readonly getStatisticsValidator = Joi.object({
        companyName: Joi.string().regex(/^[\w.]+$/),
        token: Joi.string().uuid()
    })
        .required()
        .options({ presence: 'required' });

    public async putUser(body: any): Promise<UsersPutResponse> {
        const parsedBody = validateBody<UsersPutBody>(this.putValidator, body);

        const result = await dbQuery<UsersPutResponse>(async db => {
            const company: Company | null = await db
                .collection<Company>('companies')
                .findOne({ name: parsedBody.companyName });

            if (!company) {
                throw new InvalidBodyError('Company not found', 'There is not a company with this name');
            }
            if (company.token !== parsedBody.token) {
                throw new InvalidTokenError('Invalid token');
            }

            let user: User | null = null;
            if (parsedBody.userId) {
                user = await db
                    .collection<User>('users')
                    .findOne({ _id: new ObjectId(parsedBody.userId), companyId: company._id });
            } else {
                const queryResult = await db.collection<User>('users').insertOne({
                    companyId: company._id
                });

                user = {
                    _id: new ObjectId(queryResult.insertedId),
                    companyId: company._id
                };
            }

            if (!user) {
                throw new InvalidBodyError('User not found', 'There is not a user in that company');
            }

            return {
                userId: user._id.toHexString(),
                companyId: company._id.toHexString(),
                companyName: company.name
            };
        });

        return result;
    }

    public async getStatistics(id: any, body: any): Promise<Statistic[]> {
        const parsedId = validateMongoId(id);
        const parsedBody = validateBody<UsersGetBody>(this.getStatisticsValidator, body);

        const statistics = await dbQuery<Statistic[]>(async db => {
            const company: Company | null = await db
                .collection<Company>('companies')
                .findOne({ name: parsedBody.companyName });

            if (!company) {
                throw new InvalidBodyError('Company not found', 'There is not a company with this name');
            }
            if (company.token !== parsedBody.token) {
                throw new InvalidTokenError('Invalid token');
            }

            const user = await db
                .collection<User>('users')
                .findOne({ _id: new ObjectId(parsedId), companyId: company._id });
            if (!user) {
                throw new InvalidBodyError('User not found', 'There is not a user in that company');
            }

            return await db.collection<Statistic>('statistics').find({ companyId: company._id }).toArray();
        });

        return statistics;
    }
}

export default new UsersService();

import Joi from 'joi';

import { dbQuery, ObjectId } from '@/services/db.service';

import { validateBody } from '@/utils/validation';
import { Company, User } from '@/types';
import { InvalidBodyError, InvalidTokenError } from '@/errors';

interface UsersPutBody {
    companyName: string;
    token: string;
    userId?: string | null;
}
interface UsersPutResponse {
    companyId: string;
    beaconsUUID: string;
    userId: string;
}

export class UsersService {
    protected readonly putValidator = Joi.object({
        companyName: Joi.string().regex(/^[\w.]+$/),
        token: Joi.string().uuid(),
        userId: Joi.string().min(1).allow(null).optional().default(null)
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
            if (!company.beaconsUUID) {
                throw new InvalidBodyError('Company has not bacons uuid', 'This company has not beacons uuid');
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
                beaconsUUID: company.beaconsUUID,
                companyId: company._id.toHexString()
            };
        });

        return result;
    }
}

export default new UsersService();

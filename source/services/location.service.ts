import Joi from 'joi';

import { dbQuery, ObjectId } from '@/services/db.service';

import { validateBody, validateMongoId } from '@/utils/validation';

import { Location } from '@/types';

import { InvalidIdError } from '@/errors';

type LocationCreateBody = Pick<Location, 'name' | 'beaconsMajor'>;
type LocationEditBody = LocationCreateBody;

export class LocationService {
    protected readonly postValidator = Joi.object({
        name: Joi.string().min(1),
        beaconsMajor: Joi.string().min(1)
    })
        .required()
        .options({ presence: 'required' });

    protected readonly patchValidator = Joi.object({
        name: Joi.string().min(1),
        beaconsMajor: Joi.string().min(1)
    })
        .required()
        .options({ presence: 'optional' });

    public async postLocation(cid: string, body: any): Promise<string> {
        const parsedCid = validateMongoId(cid);
        const parsedLocation = validateBody<LocationCreateBody>(this.postValidator, body);

        const id = await dbQuery<ObjectId>(async db => {
            const companyExists = await db.collection('companies').countDocuments({ _id: parsedCid });
            if (!companyExists) {
                throw new InvalidIdError('Company does not exist');
            }

            const result = await db.collection<Location>('locations').insertOne({
                ...parsedLocation,
                companyId: parsedCid
            });

            return result.insertedId;
        });

        return id.toHexString();
    }

    public async patchLocation(cid: any, id: any, body: any): Promise<void> {
        const parsedCid = validateMongoId(cid);
        const parsedId = validateMongoId(id);
        const parsedLocation = validateBody<LocationEditBody>(this.patchValidator, body);

        await dbQuery(async db => {
            const result = await db.collection<Location>('locations').updateOne(
                {
                    _id: parsedId,
                    companyId: parsedCid
                },
                {
                    $set: parsedLocation
                }
            );
            if (!result.matchedCount) {
                throw new InvalidIdError('Location does not exist');
            }
        });
    }
}

export default new LocationService();

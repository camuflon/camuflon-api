import Joi from 'joi';

import { dbQuery, ObjectId } from '@/services/db.service';

import { validateBody, validateMongoId } from '@/utils/validation';

import { Beacon } from '@/types';

import { InvalidIdError } from '@/errors';

type BeaconCreateBody = Pick<Beacon, 'beaconId' | 'locationId'>;
type BeaconEditBody = Partial<BeaconCreateBody>;

export class BeaconService {
    protected readonly postValidator = Joi.object({
        locationId: Joi.string().length(24),
        beaconId: Joi.string().min(1)
    })
        .required()
        .options({ presence: 'required' });

    protected readonly patchValidator = Joi.object({
        locationId: Joi.string().length(24),
        beaconId: Joi.string().min(1)
    })
        .required()
        .options({ presence: 'optional' });

    public async getBeacons(cid: string): Promise<Beacon[]> {
        const parsedCid = validateMongoId(cid);

        const beacons = await dbQuery<Beacon[]>(async db => {
            const companyExists = await db.collection('companies').countDocuments({ _id: parsedCid });
            if (!companyExists) {
                throw new InvalidIdError('Company does not exist');
            }

            const beacons = await db.collection<Beacon>('beacons').find({ companyId: parsedCid }).toArray();
            return beacons;
        });

        return beacons;
    }

    public async postBeacon(cid: string, body: any): Promise<string> {
        const parsedCid = validateMongoId(cid);
        const parsedBeacon = validateBody<BeaconCreateBody>(this.postValidator, body);

        const id = await dbQuery<ObjectId>(async db => {
            const companyExists = await db.collection('companies').countDocuments({ _id: parsedCid });
            if (!companyExists) {
                throw new InvalidIdError('Company does not exist');
            }

            const locationExists = await db
                .collection('locations')
                .countDocuments({ _id: new ObjectId(parsedBeacon.locationId) });
            if (!locationExists) {
                throw new InvalidIdError('Location does not exist');
            }

            const result = await db.collection<Beacon>('beacons').insertOne({
                ...parsedBeacon,
                companyId: parsedCid
            });

            return result.insertedId;
        });

        return id.toHexString();
    }

    public async patchBeacon(cid: any, id: any, body: any): Promise<void> {
        const parsedCid = validateMongoId(cid);
        const parsedId = validateMongoId(id);
        const parsedBeacon = validateBody<BeaconEditBody>(this.patchValidator, body);

        await dbQuery(async db => {
            if (parsedBeacon.locationId) {
                const locationExists = await db
                    .collection('locations')
                    .countDocuments({ _id: parsedBeacon.locationId });
                if (!locationExists) {
                    throw new InvalidIdError('Location does not exist');
                }
            }

            const result = await db.collection<Beacon>('beacons').updateOne(
                {
                    _id: parsedId,
                    companyId: parsedCid
                },
                {
                    $set: parsedBeacon
                }
            );
            if (!result.matchedCount) {
                throw new InvalidIdError('Beacon does not exist');
            }
        });
    }
}

export default new BeaconService();

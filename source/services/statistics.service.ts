import Joi from 'joi';

import { dbQuery, ObjectId } from '@/services/db.service';

import { validateBody, validateMongoId } from '@/utils/validation';
import { Beacon, Company, Location, Statistic, User } from '@/types';
import { InvalidBodyError } from '@/errors';

interface StatisticsPostBody {
    beaconId: string;
    userId: string;
    timestamp: Date;
}
interface StatisticsPostResponse {
    statisticId: string;
    locationName: string;
}

export class StatisticService {
    protected readonly postValidator = Joi.object({
        userId: Joi.string().length(24),
        beaconId: Joi.string().min(1),
        timestamp: Joi.date().iso()
    })
        .required()
        .options({ presence: 'required' });

    public async getStatistics(cid: string): Promise<Statistic[]> {
        const parsedCid = validateMongoId(cid);

        const statistics = await dbQuery<Statistic[]>(async db => {
            const company = await db.collection<Company>('companies').findOne({ _id: parsedCid });
            if (!company) {
                throw new InvalidBodyError('Company not found');
            }
            return db.collection<Statistic>('statistics').find({ companyId: parsedCid }).toArray();
        });

        return statistics;
    }

    public async postStatistic(cid: string, body: any): Promise<StatisticsPostResponse> {
        const parsedCid = validateMongoId(cid);
        const parsedBody = validateBody<StatisticsPostBody>(this.postValidator, body);

        const response = await dbQuery<StatisticsPostResponse>(async db => {
            const company: Company | null = await db
                .collection<Company>('companies')
                .findOne({ _id: new ObjectId(parsedCid) });
            if (!company) {
                throw new InvalidBodyError('Company not found', 'There is not a company with this name');
            }

            const user: User | null = await db
                .collection<User>('users')
                .findOne({ _id: new ObjectId(parsedBody.userId) });
            if (!user) {
                throw new InvalidBodyError('User not found', 'There is not a user with this id');
            }

            const beacon: Beacon | null = await db
                .collection<Beacon>('beacons')
                .findOne({ beaconId: parsedBody.beaconId });
            if (!beacon) {
                throw new InvalidBodyError('Beacon not found', 'There is not a beacon with this minor');
            }

            const location: Location | null = await db.collection<Location>('locations').findOne({
                companyId: new ObjectId(parsedCid),
                _id: new ObjectId(beacon.locationId)
            });
            if (!location) {
                throw new InvalidBodyError(
                    'Location not found',
                    'There is not a location with this beacon id and company id'
                );
            }

            const response = await db.collection<Statistic>('statistics').insertOne({
                companyId: new ObjectId(parsedCid),
                userId: new ObjectId(parsedBody.userId),
                locationId: new ObjectId(location._id),
                timestamp: parsedBody.timestamp,
                beaconId: new ObjectId(beacon._id)
            });

            return {
                locationName: location.name,
                statisticId: response.insertedId.toHexString()
            };
        });

        return response;
    }
}

export default new StatisticService();

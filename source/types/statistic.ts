import { ObjectId } from 'mongodb';

export interface Statistic {
    _id: ObjectId;
    companyId: ObjectId;
    locationId: ObjectId;
    userId: ObjectId;
    timestamp: Date;
    beaconMinor: string;
}

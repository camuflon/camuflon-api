import { ObjectId } from 'mongodb';

export interface Statistics {
    _id: ObjectId;
    companyId: ObjectId;
    locationId: ObjectId;
    userId: ObjectId;
    timestamp: Date;
    beaconMinor: string;
}

import { ObjectId } from 'mongodb';

export interface Beacon {
    _id: ObjectId;
    companyId: ObjectId;
    locationId: ObjectId;
    beaconId: string;
}

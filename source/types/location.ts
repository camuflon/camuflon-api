import { ObjectId } from 'mongodb';

export interface Location {
    _id: ObjectId;
    companyId: ObjectId;
    name: string;
    beaconsMajor: ObjectId;
}

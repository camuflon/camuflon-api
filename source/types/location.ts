import { ObjectId } from 'mongodb';

export interface Location {
    _id: ObjectId;
    name: string;
    beaconsMajor: ObjectId;
}

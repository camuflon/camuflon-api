import { ObjectId } from 'mongodb';

export interface Company {
    _id: ObjectId;
    name: string;
    email: string;
    beaconsUUID: string;
    token: string;
    password: string;
}

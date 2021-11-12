import { ObjectId } from 'mongodb';

export interface Company {
    _id: ObjectId;
    name: string;
    email: string;
    beaconsUUID: string | null;
    token: string;
    password: string;
}

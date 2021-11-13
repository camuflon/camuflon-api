import { ObjectId } from 'mongodb';

export interface Company {
    _id: ObjectId;
    name: string;
    email: string;
    token: string;
    password: string;
}

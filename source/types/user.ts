import { ObjectId } from 'mongodb';

export interface User {
    _id: ObjectId;
    companyId: ObjectId;
}

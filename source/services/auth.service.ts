import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import logger from '@/utils/logger';
import { dbQuery, ObjectId } from '@/services/db.service';
import { InvalidCredentialsError, NotFoundError } from '@/errors';

import { Company } from '@/types';

import CONFIG from '@/config';

export interface AuthResponse {
    token: string;
    company: Pick<Company, 'name' | 'email' | 'token'> & { _id: string };
}
export class AuthService {
    private readonly jwtAlgorithm: string;
    private readonly jwtPrivatePassword: string;
    private readonly jwtExpiration: string;
    private readonly jwtIssuer: string;

    constructor() {
        this.jwtAlgorithm = CONFIG.SECURITY.JWT.ALGORITHM;
        this.jwtPrivatePassword = CONFIG.SECURITY.JWT.PRIVATE_PASSWORD;
        this.jwtExpiration = CONFIG.SECURITY.JWT.EXPIRATION;
        this.jwtIssuer = CONFIG.SECURITY.JWT.ISSUER;
    }

    private async findById(id: ObjectId): Promise<Company | null> {
        return dbQuery(async db => {
            return db.collection<Company>('companies').findOne({ _id: id });
        });
    }

    private async findByCompanyName(name: string): Promise<Company | null> {
        return dbQuery(async db => {
            return db.collection<Company>('companies').findOne({ name });
        });
    }

    private async findByCompanyEmail(email: string): Promise<Company | null> {
        return dbQuery(async db => {
            return db.collection<Company>('companies').findOne({ email });
        });
    }

    public async verifyCredentials(identifier: string, password: string): Promise<Company> {
        let company: Company | null = null;

        company = await (identifier.includes('@')
            ? this.findByCompanyEmail(identifier)
            : this.findByCompanyName(identifier));

        if (company === null) {
            throw new InvalidCredentialsError('Wrong credentials');
        }
        const rightPassword = await bcrypt.compare(password, company.password);
        if (!rightPassword) {
            throw new InvalidCredentialsError('Wrong credentials');
        }
        return company;
    }

    public async verifyCompanyWithJwt(jwtPayload: any): Promise<Company> {
        const idRaw: string | null = jwtPayload?.sub;
        const id = idRaw ? new ObjectId(idRaw) : null;
        if (id === null) {
            throw new InvalidCredentialsError('Invalid token');
        }
        const company = await this.findById(id);
        if (company === null) {
            throw new InvalidCredentialsError('Invalid token');
        }
        return company;
    }

    public generateAuthResponse(company: Company): AuthResponse {
        const sub = company._id.toHexString();
        const token = jwt.sign({ sub }, this.jwtPrivatePassword, {
            algorithm: this.jwtAlgorithm as jwt.Algorithm,
            expiresIn: this.jwtExpiration,
            issuer: this.jwtIssuer
        });

        const response: AuthResponse = {
            token,
            company: {
                _id: company._id.toHexString(),
                name: company.name,
                email: company.email,
                token: company.token
            }
        };
        return response;
    }

    public serializeCompany(company: Company): string {
        return company._id.toHexString();
    }

    public async deserializeCompany(id: ObjectId): Promise<Company> {
        try {
            const company = await this.findById(id);
            if (company === null) {
                throw new NotFoundError('Company with uid not found');
            }
            return company;
        } catch (error) {
            logger.warning('Error in deserializing company', error);
            throw error;
        }
    }
}

export default new AuthService();

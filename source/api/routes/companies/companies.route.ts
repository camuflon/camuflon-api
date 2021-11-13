import { Router } from 'express';

import { authenticateJwt } from '@/utils/auth';
import asyncHandler from '@/utils/asyncHandler';
import companyService from '@/services/company.service';

import { UserNotAuthorizedError } from '@/errors';
import { Company } from '@/types';

export default function (): Router {
    const router = Router();

    router.get('/:id', authenticateJwt, (req, res) => {
        const id = req.params.id;
        const company = req.user as Company;

        if (company._id.toHexString() !== id) {
            throw new UserNotAuthorizedError();
        }

        res.json(company);
    });

    router.post(
        '/',
        asyncHandler(async (req, res) => {
            const body = req.body;
            const response = await companyService.postCompany(body);
            res.json(response);
        })
    );

    return router;
}

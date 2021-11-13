import { Router } from 'express';

import { authenticateJwt } from '@/utils/auth';
import asyncHandler from '@/utils/asyncHandler';
import authService from '@/services/auth.service';
import companyService from '@/services/company.service';

import { Company } from '@/types';

export default function (): Router {
    const router = Router();

    router.get('/me', authenticateJwt, (req, res) => {
        const company = req.user as Company;
        const response = authService.generateAuthResponse(company);
        res.json(response);
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

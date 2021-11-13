import { Router } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import companyService from '@/services/company.service';

export default function (): Router {
    const router = Router();

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

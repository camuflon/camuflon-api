import { Router } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import { authenticateJwt } from '@/utils/auth';
import companyService from '@/services/company.service';

import locationsRouter from './locations/locations.route';
import statisticsRouter from './statistics/statistics.route';

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

    router.patch(
        '/:id',
        asyncHandler(async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            await companyService.patchCompany(id, body);
            res.json();
        })
    );

    router.use('/:cid/locations', authenticateJwt, locationsRouter());
    router.use('/:cid/statistics', statisticsRouter());

    return router;
}

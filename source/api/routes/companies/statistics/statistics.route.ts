import { Router } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import { authenticateJwt } from '@/utils/auth';
import statisticsService from '@/services/statistics.service';

export default function (): Router {
    const router = Router({ mergeParams: true });

    router.get(
        '/',
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const statistics = await statisticsService.getStatistics(cid);
            res.json(statistics);
        })
    );

    router.post(
        '/',
        authenticateJwt,
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const body = req.body;
            const response = await statisticsService.postStatistic(cid, body);
            res.json(response);
        })
    );

    return router;
}

import { Router } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import locationService from '@/services/location.service';

export default function (): Router {
    const router = Router({ mergeParams: true });

    router.get(
        '/',
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const response = await locationService.getLocations(cid);
            res.json(response);
        })
    );

    router.post(
        '/',
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const body = req.body;
            const response = await locationService.postLocation(cid, body);
            res.json(response);
        })
    );

    router.patch(
        '/:id',
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const id = req.params.id;
            const body = req.body;
            await locationService.patchLocation(cid, id, body);
            res.json();
        })
    );

    return router;
}

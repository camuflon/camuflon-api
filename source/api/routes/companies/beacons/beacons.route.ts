import { Router } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import beaconService from '@/services/beacon.service';

export default function (): Router {
    const router = Router({ mergeParams: true });

    router.get(
        '/',
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const response = await beaconService.getBeacons(cid);
            res.json(response);
        })
    );

    router.post(
        '/',
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const body = req.body;
            const response = await beaconService.postBeacon(cid, body);
            res.json(response);
        })
    );

    router.patch(
        '/:id',
        asyncHandler(async (req, res) => {
            const cid = req.params.cid;
            const id = req.params.id;
            const body = req.body;
            await beaconService.patchBeacon(cid, id, body);
            res.json();
        })
    );

    return router;
}

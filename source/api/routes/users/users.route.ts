import { Router } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import usersService from '@/services/users.service';

export default function (): Router {
    const router = Router({ mergeParams: true });

    router.put(
        '/',
        asyncHandler(async (req, res) => {
            const body = req.body;
            const response = await usersService.putUser(body);
            res.json(response);
        })
    );

    return router;
}

import { Router } from 'express';

import { authenticateJwt, authenticateLocal } from '@/utils/auth';
import authService from '@/services/auth.service';

import { Company } from '@/types';

export default function (): Router {
    const router = Router();

    router.post('/login', authenticateLocal, (req, res) => {
        const company = req.user as Company;
        const response = authService.generateAuthResponse(company);
        res.json(response);
    });

    router.get('/me', authenticateJwt, (req, res) => {
        const company = req.user as Company;
        const response = authService.generateAuthResponse(company);
        res.json(response);
    });

    return router;
}

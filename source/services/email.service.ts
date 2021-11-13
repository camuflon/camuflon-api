/* eslint-disable @typescript-eslint/naming-convention */
import { createTransport, Transporter } from 'nodemailer';
import { pugEngine } from 'nodemailer-pug-engine';

import logger from '@/utils/logger';
import { Company } from '@/types';

import CONFIG from '@/config';

const EmailTemplates = {
    NEW_USER: 'new_user'
};

export class EmailService {
    private readonly mailer: Transporter;

    constructor() {
        this.mailer = createTransport({
            service: 'Gmail',
            auth: {
                type: CONFIG.EMAIL.TYPE,
                user: CONFIG.EMAIL.USER,
                clientId: CONFIG.EMAIL.CLIENT_ID,
                clientSecret: CONFIG.EMAIL.CLIENT_SECRET,
                refreshToken: CONFIG.EMAIL.REFRESH_TOKEN,
                accessToken: CONFIG.EMAIL.ACCESS_TOKEN,
                expires: CONFIG.EMAIL.EXPIRES
            }
        } as any);
        this.mailer.use(
            'compile',
            pugEngine({
                templateDir: CONFIG.EMAIL.TEMPLATES_PATH
            })
        );
    }

    private async sendEmail(
        to: string | string[],
        bcc: string | string[],
        subject: string,
        template: string,
        ctx: any,
        attachments: any[] = []
    ) {
        try {
            await this.mailer.sendMail({
                from: 'info@camuflown.it',
                to,
                bcc,
                subject,
                template,
                ctx: { ...ctx },
                attachments: [...attachments]
            } as any);
        } catch (error) {
            logger.error('Email error', error);
            throw new Error('Email error');
        }
    }

    public async newUser(company: Company): Promise<void> {
        const subject = 'Camuflown - Registration of new user';
        const template = EmailTemplates.NEW_USER;
        const ctx = {
            name: company.name
        };

        await this.sendEmail([], company.email, subject, template, ctx);
    }
}

export default new EmailService();

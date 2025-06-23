import { emailConfig, emailFrom } from '../config/email.config'
import nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'

// Errors
import { EmailSendError } from '../errors/emailSendError'
import { EmailPasswordSendError } from '../errors/emailPasswordSendError'

export class EmailService {
    private transporter: any

    constructor() {
        this.transporter = nodemailer.createTransport(emailConfig)
    }

    private async loadTemplate(templateName: string, replacements: {[ key: string]: string}): Promise<string> {
        const filePath = path.join(__dirname, '..', 'templates', `${templateName}.html`)
        let template = await fs.promises.readFile(filePath, 'utf-8')

        for (const [key, value] of Object.entries(replacements)) {
            template = template.replace(new RegExp(`{{${key}}}`, 'g'), value)
        }

        return template
    }

    async sendVerificationEmail(to: string, verificationLink: string): Promise<void> {
        try {
            const html = await this.loadTemplate('email.verification', {verificationLink})
            await this.transporter.sendMail({
                from: emailFrom,
                to: to,
                subject: 'Kempes Master League / El link para verificar tu mail está listo!',
                html: html
            })
        } catch (e) {
            throw new EmailSendError();
        }
    }

    async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
        try {
            const html = await this.loadTemplate('email.resetPassword', {resetLink})
            await this.transporter.sendMail({
                from: emailFrom,
                to: to,
                subject: 'Kempes Master League / El link para cambiar tu contraseña está listo!',
                html: html
            })
        } catch (error) {
            throw new EmailPasswordSendError()
        }
    }
}
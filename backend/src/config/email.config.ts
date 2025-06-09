import dotenv from 'dotenv';

dotenv.config();

export const emailConfig = {
    host: 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM 
}
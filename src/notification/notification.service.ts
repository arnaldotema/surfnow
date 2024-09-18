import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class NotificationService {
    private transporter;
    private twilioClient;

    constructor(private configService: ConfigService) {
        // Set up Nodemailer for email notifications
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: false, // Use TLS
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
            tls: {
                rejectUnauthorized: false, // For Gmail
            },
        });
        // Set up Twilio for SMS notifications
        this.twilioClient = Twilio(
            this.configService.get('TWILIO_ACCOUNT_SID'),
            this.configService.get('TWILIO_AUTH_TOKEN'),
        );
    }

    // Function to send email notifications
    async sendEmailNotification(to: string, subject: string, html: string) {
        await this.transporter.sendMail({
            from: `"SurfNow" <${this.configService.get('SMTP_USER')}>`,
            to,
            subject,
            html,
        });
    }

    // Function to send text message notifications
    async sendTextMessage(to: string, message: string) {
        await this.twilioClient.messages.create({
            body: message,
            from: this.configService.get('TWILIO_PHONE_NUMBER'),
            to,
        });
    }
}
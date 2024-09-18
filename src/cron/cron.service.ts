import {Injectable, OnModuleInit} from '@nestjs/common';
import { SurfCheckerService } from '../surf-checker/surf-checker.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import {Cron, CronExpression} from "@nestjs/schedule";

@Injectable()
export class CronService implements OnModuleInit {
    private notifiedUsers: Map<string, Set<string>> = new Map(); // Tracks notifications by user and beach

    constructor(
        private surfCheckerService: SurfCheckerService,
        private usersService: UsersService,
        private notificationService: NotificationService,
    ) {}

    onModuleInit() {
        this.handleCron();
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {

        console.log(`Running cron job at ${new Date().toISOString()}`);

        const beachUrls = [
            'https://beachcam.meo.pt/livecams/costa-da-caparica/',
            'https://beachcam.meo.pt/livecams/costa-da-caparica-praia-nova/',
            'https://beachcam.meo.pt/livecams/costa-da-caparica-cds/',
            'https://beachcam.meo.pt/livecams/fonte-da-telha/',
            'https://beachcam.meo.pt/livecams/peniche-supertubos/',
            'https://beachcam.meo.pt/livecams/penichesupertubosestatica/',
            'https://beachcam.meo.pt/livecams/praia-do-guincho/',
            'https://beachcam.meo.pt/livecams/costa-da-caparica-tarquinio/',
            'https://beachcam.meo.pt/livecams/costa-de-caparica-sao-joao-estatica/',
            'https://beachcam.meo.pt/livecams/fonte-da-telha-sul/',
        ];
        const beachReports = await this.surfCheckerService.checkSurfConditions(beachUrls);
        const users = this.usersService.getUsersCriteria();

        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        for (const user of users) {
            if (user.optOut) {
                console.log(`User ${user.email} has opted out of notifications.`);
                continue;
            }
            console.log(`Checking surf conditions for user ${user.email}`);

            // Flatten the beach reports to extract all conditions with their corresponding beach URLs
            const matchingBeaches: BeachStatus[] = beachReports.flatMap(beachReport => this.parseConditions(beachReport));

            // Filter out conditions that meet the user's criteria
            const conditionsMeetingCriteria = matchingBeaches
                .filter(beach => beach.waveHeightValue >= user.criteria.minWaveHeight);

            // Check if the user has already been notified about these beaches today
            const newMatchingBeaches = conditionsMeetingCriteria.filter(beach => {
                if (!this.notifiedUsers.has(user.email)) {
                    this.notifiedUsers.set(user.email, new Set());
                }
                return !this.notifiedUsers.get(user.email).has(`${today}-${beach.url}-${beach.time}`);
            });

            console.log(`Found ${newMatchingBeaches.length} new matching beaches.`);

            if (newMatchingBeaches.length > 0) {
                const emailContent = this.generateEmailContent(newMatchingBeaches);
                const textMessageContent = this.generateTextMessageContent(newMatchingBeaches);

                // Attempt to send email notification
                try {
                    console.log(`Attempting to send email to user ${user.email} with matching beaches.`);
                    await this.notificationService.sendEmailNotification(user.email, 'Yoo, there are some waves! 🌊🌊', emailContent);
                    console.log(`Email sent successfully to ${user.email}.`);
                } catch (error) {
                    console.error(`Failed to send email to ${user.email}:`, error);
                }

                // Attempt to send text message notification
                if (user.phoneNumber) {
                    try {
                        console.log(`Attempting to send text message to user ${user.phoneNumber}.`);
                        await this.notificationService.sendTextMessage(user.phoneNumber, textMessageContent);
                        console.log(`Text message sent successfully to ${user.phoneNumber}.`);
                    } catch (error) {
                        console.error(`Failed to send text message to ${user.phoneNumber}:`, error);
                    }
                }

                // Record that the user has been notified about these beaches today
                newMatchingBeaches.forEach(beach => {
                    this.notifiedUsers.get(user.email).add(`${today}-${beach.url}-${beach.time}`);
                });
            }
        }
    }

    private parseConditions(beachReport): BeachStatus[] {
        return beachReport.conditions
            .map(condition => {
                // Parse wave height if it exists
                if (condition.waveHeight) {
                    const waveHeightValue = parseFloat(condition.waveHeight.replace(/[^\d.]/g, ''));
                    console.log(`Parsed wave height for ${beachReport.url} at ${condition.time}: ${waveHeightValue}`);
                    return {
                        url: beachReport.url,
                        time: condition.time,
                        waveHeightValue,
                        waveHeight: condition.waveHeight,
                        windSpeed: condition.windSpeed,
                    };
                }
                return null;
            })
            .filter(item => item !== null) as BeachStatus[]; // Remove nulls and assert the type
    }

    generateEmailContent(matchingBeaches: BeachStatus[]): string {
        let content = '<h1>Yeaa 🤙🤙🌊</h1>';
        for (const beach of matchingBeaches) {
            content += `<h2>Praia 🏝️: ${beach.url}</h2>`;
            content += `<p>Time ⏰: ${beach.time}</p>`;
            content += `<p>Wave Height 🌊: ${beach.waveHeight || 'N/A'}</p>`;
            content += `<p>Wind Speed 🌬️: ${beach.windSpeed || 'N/A'}</p>`;
        }
        content += `<p>(flat and probably windy as always innit lol 😅) btw this is just me playing around, create an account at <a href="https://beachcam.meo.pt/">Beachcam's website</a> for more deets.</p>`;
        return content;
    }

    generateTextMessageContent(matchingBeaches: BeachStatus[]): string {
        let content = `Looks like it's surfable! 🌊🏄\n`;
        for (const beach of matchingBeaches) {
            content += `Praia 🏝️: ${beach.url}\n`;
            content += `Time ⏰: ${beach.time}\n`;
            content += `Wave Height 🌊: ${beach.waveHeight || 'N/A'}\n`;
            content += `Wind Speed 🌬: ${beach.windSpeed || 'N/A'}\n`;
            content += `\n`; // Add a line break between beach reports for readability
        }
        return content;
    }

    /*// Run the job once at startup
    onModuleInit() {
        this.handleCron();
    }*/
}
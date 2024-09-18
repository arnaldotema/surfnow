import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ConfigService } from '@nestjs/config';
import { navigateWithRetry } from "../utils";

@Injectable()
export class SurfCheckerService {
    private browser: puppeteer.Browser | null = null;

    constructor(private configService: ConfigService) {
        globalThis.process.on('SIGINT', async () => {
            console.log('Caught interrupt signal (SIGINT)');
            await this.cleanup();
            process.exit(0);
        });

        globalThis.process.on('SIGTERM', async () => {
            console.log('Caught termination signal (SIGTERM)');
            await this.cleanup();
            process.exit(0);
        });

        // Uncaught exception handler doesn't need async handling
        globalThis.process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            this.cleanup().then(() => process.exit(1));
        });
    }

    private async cleanup() {
        if (this.browser) {
            console.log('Cleaning up Puppeteer browser...');
            await this.browser.close();
            this.browser = null;
        }
    }

    async checkSurfConditions(beachUrls: string[]): Promise<BeachReport[]> {
        const email = this.configService.get('BEACHCAM_EMAIL');
        const password = this.configService.get('BEACHCAM_PASSWORD');

        this.browser = await puppeteer.launch();
        const beachReports = [];

        try {
            const page = await this.browser.newPage();
            try {
                console.log(`Navigating to login page...`);
                await navigateWithRetry(page, 'https://beachcam.meo.pt/login/');

                console.log(`Typing email and password...`);
                await page.type('#signInModel_Username', email);
                await page.type('#signInModel_Password', password);
                await page.click('button[type="submit"]');

                console.log(`Waiting for navigation after login...`);
                await page.waitForNavigation({ timeout: 30000 });
                console.log(`Logged in successfully.`);
            } catch (error) {
                console.error(`Error during login:`, error);
                throw error; // Rethrow to handle it outside if necessary
            } finally {
                await page.close(); // Close login page
            }

            for (const url of beachUrls) {
                const surfPage = await this.browser.newPage();
                try {
                    console.log(`Navigating to ${url}`);
                    await surfPage.goto(url, { timeout: 10000 });
                    console.log(`Crawling ${url}`);

                    // Scrape surf report including future forecasts
                    const surfReport = await surfPage.evaluate(() => {
                        // Scrape data
                        const conditions = [];

                        // Extract current conditions
                        let currentWaveHeight = '';
                        let currentWindSpeed = '';

                        const waveHeightLabel = Array.from(document.querySelectorAll('.liveCamsDetailAside__weather-col-inside label'))
                            .find(label => label.textContent?.trim() === 'Ondulação');

                        const windSpeedLabel = Array.from(document.querySelectorAll('.liveCamsDetailAside__weather-col-inside label'))
                            .find(label => label.textContent?.trim() === 'Vento');

                        if (waveHeightLabel) {
                            const waveHeightElement = waveHeightLabel.nextElementSibling as HTMLElement;
                            currentWaveHeight = waveHeightElement?.innerText;
                        }

                        if (windSpeedLabel) {
                            const windSpeedElement = windSpeedLabel.nextElementSibling as HTMLElement;
                            currentWindSpeed = windSpeedElement?.innerText;
                        }

                        conditions.push({ time: 'now', waveHeight: currentWaveHeight, windSpeed: currentWindSpeed });

                        // Extract forecast conditions
                        const forecastTabs = document.querySelectorAll('.forecasts__tabsContent-item');
                        forecastTabs.forEach(tab => {
                            const timeLabel = tab.querySelector('.beachcamChip__date')?.textContent;
                            const waveHeightForecast = tab.querySelector('td:nth-child(2) strong')?.textContent;
                            const windSpeedForecast = tab.querySelector('td:nth-child(5) strong')?.textContent;

                            if (timeLabel && waveHeightForecast) {
                                conditions.push({
                                    time: timeLabel,
                                    waveHeight: waveHeightForecast.trim(),
                                    windSpeed: windSpeedForecast ? windSpeedForecast.trim() : undefined
                                });
                            }
                        });

                        return conditions;
                    });

                    console.log(`Scraped conditions for ${url}:`, surfReport);
                    beachReports.push({ url, conditions: surfReport });
                } catch (error) {
                    console.error(`Error while crawling ${url}:`, error);
                    await surfPage.screenshot({ path: `error-${Date.now()}.png` });
                } finally {
                    await surfPage.close(); // Close the page after processing
                }
            }

        } catch (error) {
            console.error(`Error in checkSurfConditions:`, error);
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        }

        return beachReports;
    }
}
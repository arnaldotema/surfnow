export async function navigateWithRetry(page, url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}: Navigating to ${url}`);
            await page.goto(url, { timeout: 5000 });
            return;
        } catch (error) {
            console.error(`Navigation attempt ${i + 1} failed for ${url}:`, error);
            if (i === retries - 1){
                await page.screenshot({ path: `error-${Date.now()}.png` });
                throw error;
            }
        }
    }
}
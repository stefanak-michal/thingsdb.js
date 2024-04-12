import { test, expect } from '@playwright/test';

test('perform ThingsDB test', async ({ page }) => {
    await page.goto('http://localhost:9000/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle("ThingsDB.js");

    const connected = await page.evaluate(() => {
        window["thingsdb"] = new window["ThingsDB"]();
        return window["thingsdb"].connect();
    });
    expect(connected).toBeTruthy();

    const ping = await page.evaluate(() => window["thingsdb"].ping())
    expect(ping).toBeTruthy();

});

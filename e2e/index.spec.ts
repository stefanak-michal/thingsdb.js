import { test, expect } from '@playwright/test';
import ThingsDB from "../src/ThingsDB";

test('perform ThingsDB test', async ({ page }) => {
    await page.goto('http://localhost:9000/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle("ThingsDB.js");

    const connected = await page.evaluate(() => {
        var thingsdb = new ThingsDB();
        return thingsdb.connect();
    });
    expect(connected).toBeTruthy();
});

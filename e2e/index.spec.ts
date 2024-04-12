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

    await page.evaluate(() => window["thingsdb"].ping())
    await page.evaluate(() => window["thingsdb"].auth())

    const hello = await page.evaluate(() => window["thingsdb"].query('@thingsdb', '"Hello World!"'));
    expect(hello).toBe('Hello World!');

    const roomId = await page.evaluate(() => window["thingsdb"].query('@:stuff', `if (.has("test_room")) .del("test_room");
.test_room = room();
.test_room.id();`));
    expect(roomId).toBeGreaterThan(0);

    const watchDog = page.waitForFunction(() => window["joined"] || false, null, {timeout: 5});
    await page.evaluate((r) => {
        window["joined"] = false;
        window["thingsdb"].addEventListener((type: number): void => { window["joined"] = type == 6; });
        return window["thingsdb"].join('@:stuff', r);
    }, roomId);
    await watchDog;
});

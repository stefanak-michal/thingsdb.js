import { test, expect } from '@playwright/test';

test('perform ThingsDB test', async ({ page }) => {
    await page.goto('http://localhost:9000/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle("ThingsDB.js");

    await page.evaluate((url) => {
        window["thingsdb"] = new window["ThingsDB"](url);
        return window["thingsdb"].connect();
    }, process.env.URL || 'ws://127.0.0.1:9270');

    await page.evaluate(() => window["thingsdb"].ping())
    await page.evaluate(() => window["thingsdb"].auth())

    const hello = await page.evaluate(() => window["thingsdb"].query('@thingsdb', '"Hello World!";'));
    expect(hello).toBe('Hello World!');

    const roomId = await page.evaluate(() => window["thingsdb"].query('@:stuff', `if (.has("test_room")) .del("test_room");
.test_room = room();
.test_room.id();`));
    expect(roomId).toBeGreaterThan(0);

    let watchDog = page.waitForFunction(() => window["joined"] || false, null, {timeout: 5000});
    await page.evaluate((r) => {
        window["joined"] = false;
        window["thingsdb"].addEventListener((type: number): void => { window["joined"] = type == 6; });
        return window["thingsdb"].join('@:stuff', r);
    }, roomId);
    await watchDog;

    watchDog = page.waitForFunction(() => window["emitted"] || false, null, {timeout: 5000});
    const id = await page.evaluate(() => {
        window["emitted"] = false;
        window["thingsdb"].addEventListener((type: number, message: any): void => { window["emitted"] = (
            type == 8
            && message.event === "test-event"
            && message.args.toString() === 'Testing event'
        ); });
        return window["thingsdb"].query('@:stuff', `task(
    datetime().move("seconds", 2), 
    || .test_room.emit("test-event", "Testing event")
).id();`)
    });
    expect(id).toBeGreaterThan(0);
    await watchDog;

});

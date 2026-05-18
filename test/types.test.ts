import ThingsDB from '../src/ThingsDB';
import { expect, test } from '@jest/globals';

test('typescript entry exports ThingsDB class', () => {
    const thingsdb = new ThingsDB();
    expect(thingsdb).toBeInstanceOf(ThingsDB);
});

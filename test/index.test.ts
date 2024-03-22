import ThingsDB from '../src/index';
import { expect, test } from '@jest/globals';

const thingsdb = new ThingsDB();

test('connect', () => {
    return thingsdb.connect().then((success) => {
        expect(success).toBeTruthy();
    });
})

test('ping', () => {
    return thingsdb.ping().then((success) => {
        expect(success).toBeTruthy();
    });
})

test('auth', () => {
    return thingsdb.auth().then(() => {
        expect(true).toBeTruthy();
    });

})

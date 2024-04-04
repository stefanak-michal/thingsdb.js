import ThingsDB from '../src/index';
import { expect, test, beforeAll } from '@jest/globals';


const thingsdb = new ThingsDB('ws://127.0.0.1:7681');

beforeAll(() => {
    return thingsdb.connect();
});

test('ping', () => {
    return thingsdb.ping();
});

test('auth', () => {
    return thingsdb.auth();
});

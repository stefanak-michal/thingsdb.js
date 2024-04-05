import ThingsDB from '../src/index';
import { expect, test, beforeAll, describe } from '@jest/globals';


const thingsdb = new ThingsDB('ws://127.0.0.1:7681');

beforeAll(() => {
    return thingsdb.connect();
});

test('ping', () => {
    return thingsdb.ping();
});

describe('auth required', () => {
    beforeAll(() => {
        return thingsdb.auth();
    });

    test('query', async () => {
        await expect(thingsdb.query('@thingsdb', '"Hello World!"')).resolves.toBe('Hello World!');
    });

    test('query with arguments', async () => {
        await expect(thingsdb.query('@thingsdb', 'a + b', { a: 1, b: 2 })).resolves.toBe(3);
    });

    describe('collection', () => {
        beforeAll(async () => {
            const exists = await thingsdb.query('@thingsdb', 'has_collection(colName);', { colName: 'stuff' });
            if (!exists) {
                const name = await thingsdb.query('@thingsdb', 'new_collection(colName);', { colName: 'stuff' });
                expect(name).toBe('stuff');
            }
            return thingsdb.query('@:stuff', '.id();').then(id => {
                expect(typeof id).toBe('number');
                expect(id).toBeGreaterThan(0);
            });
        });

        test('procedure', async () => {
            const exists = await thingsdb.query('@:stuff', 'has_procedure(procName);', { procName: 'add_one' });
            if (exists)
                await expect(thingsdb.query('@:stuff', 'del_procedure(procName);', { procName: 'add_one' })).resolves.toBeNull();
            await expect(thingsdb.query('@:stuff', 'new_procedure(procName, |a| a + 1);', { procName: 'add_one' })).resolves.toBe('add_one');
            await expect(thingsdb.run('@:stuff', 'add_one', [5])).resolves.toBe(6);
        })
    });

    test('authToken', async () => {
        const token = await thingsdb.query('@thingsdb', 'new_token("admin", datetime().move("minutes", 1));');
        expect(token).toBeTruthy();
        return thingsdb.authToken(token);
    });
});

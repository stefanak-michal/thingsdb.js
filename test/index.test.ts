import ThingsDB from '../src/ThingsDB';
import { jest, expect, test, beforeAll, describe, afterAll } from '@jest/globals';
import waitForExpect from "wait-for-expect";
import EventType from "../src/EventType";

const thingsdb = new ThingsDB(process.env.URL || 'ws://127.0.0.1:9270');

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
        await expect(thingsdb.query('@thingsdb', '"Hello World!";')).resolves.toBe('Hello World!');
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
        });

        test('join non existing rooms', async () => {
            await thingsdb.query('@:stuff', 'if (.has("test_room")) .del("test_room");');
            await expect(thingsdb.join('@:stuff', 5, 6)).resolves.toStrictEqual([null, null]);
        });

        describe('room', () => {
            let roomId: number;
            beforeAll(async () => {
                roomId = await thingsdb.query('@:stuff', '.test_room = room(); .test_room.id();');
            });

            test('join', async () => {
                const fn = jest.fn((type: number, message: any): void => {
                    expect(type).toBe(EventType.ON_JOIN);
                });

                thingsdb.addEventListener(fn);
                await expect(thingsdb.join('@:stuff', roomId)).resolves.toEqual([roomId]);
                await waitForExpect(() => {
                    expect(fn).toBeCalledTimes(1);
                    thingsdb.removeEventListener(fn);
                });
            });

            test('emit', async () => {
                const fn = jest.fn((type: number, message: any): void => {
                    expect(type).toBe(EventType.ON_EMIT);
                    expect(message).toHaveProperty('event');
                    if (message.event === 'test-message') expect(message.args).toEqual([]);
                    else if (message.event === 'test-message-with-args') expect(message.args).toEqual([42, 'hello']);
                    else throw new Error('Wrong event');
                });

                thingsdb.addEventListener(fn);
                await thingsdb.emit('@:stuff', roomId, 'test-message');
                await thingsdb.emit('@:stuff', roomId, 'test-message-with-args', [42, 'hello']);
                await waitForExpect(() => {
                    expect(fn).toBeCalledTimes(2);
                    thingsdb.removeEventListener(fn);
                });
            });

            test('emitPeers', async () => {
                const fn = jest.fn((type: number, message: any): void => {
                    // Should not receive echo back when using emitPeers
                    expect(type).toBe(EventType.ON_EMIT);
                    throw new Error('Should not receive echo back from emitPeers');
                });

                thingsdb.addEventListener(fn);
                // emitPeers should not echo back to this connection
                await thingsdb.emitPeers('@:stuff', roomId, 'test-peers-message');
                await thingsdb.emitPeers('@:stuff', roomId, 'test-peers-with-args', [99, 'world']);
                
                // Wait a short time to ensure no event is received
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Verify no events were received
                expect(fn).toBeCalledTimes(0);
                thingsdb.removeEventListener(fn);
            });

            test('wait for emit', async () => {
                const fn = jest.fn((type: number, message: any): void => {
                    expect(type).toBe(EventType.ON_EMIT);
                    expect(message.event).toBe('test-event');
                    expect(message.args).toEqual(['Testing event 2']);
                });

                thingsdb.addEventListener(fn);
                await expect(thingsdb.query('@:stuff', `task(
    datetime().move("seconds", 2), 
    || .test_room.emit("test-event", "Testing event 2")
).id();`)).resolves.toBeGreaterThan(0);
                await waitForExpect(() => {
                    expect(fn).toBeCalledTimes(1);
                    thingsdb.removeEventListener(fn);
                });
            });

            test('leave', async () => {
                const fn = jest.fn((type: number, message: any): void => {
                    expect(type).toBe(EventType.ON_LEAVE);
                });

                thingsdb.addEventListener(fn);
                await expect(thingsdb.leave('@:stuff', roomId)).resolves.toEqual([roomId]);
                await waitForExpect(() => {
                    expect(fn).toBeCalledTimes(1);
                    thingsdb.removeEventListener(fn);
                });
            })
        });
    });

    test('authToken', async () => {
        const token = await thingsdb.query('@thingsdb', 'new_token("admin", datetime().move("minutes", 1));');
        expect(token).toBeTruthy();
        return thingsdb.authToken(token);
    });

    afterAll(() => {
        return thingsdb.disconnect();
    });
});

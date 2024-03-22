import ThingsDB from '../src/index';
import { expect, test } from '@jest/globals';

test('auth', () => {
    const db = new ThingsDB();
    db.auth('admin', 'pass');
    expect(db).toBeTruthy();
})
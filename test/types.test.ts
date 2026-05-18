import ThingsDB from '../src/thingsdb';

test('typescript entry exports ThingsDB class', () => {
    const thingsdb = new ThingsDB();
    expect(thingsdb).toBeInstanceOf(ThingsDB);
});

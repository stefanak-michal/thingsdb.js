import ThingsDB from '../src/ThingsDB';

test('typescript entry exports ThingsDB class', () => {
    const thingsdb = new ThingsDB();
    expect(thingsdb).toBeInstanceOf(ThingsDB);
});

import { encode, decode } from "messagepack";
import EventType from "./EventType";
const WebSocketClient = require('websocket').w3cwebsocket;

/**
 * Class ThingsDB
 * @author Michal Stefanak
 * @link https://github.com/stefanak-michal/thingsdb.js/
 */
class ThingsDB {
    private ws: typeof WebSocketClient;
    private id: number = 1;
    private readonly uri: string;
    private pending: { [index: number]: { resolve: (value: any) => void, reject: (value: any) => void }} = {};
    private listeners = new Set<(type: number, message: any) => void>();
    private closePromise: any[] = [];

    constructor(uri: string = 'ws://127.0.0.1:9270') {
        this.uri = uri;
    }

    /**
     * Initialize websocket connection
     */
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocketClient(this.uri);
            this.ws.binaryType = "arraybuffer";

            this.ws.onopen = () => {
                // on successful connection update onerror action
                this.ws.onerror = (event: ErrorEvent) => {
                    if (this.closePromise.length) {
                        this.closePromise[1](event);
                        this.closePromise = [];
                    } else {
                        throw event;
                    }
                }
                resolve();
            }

            this.ws.onclose = (event: CloseEvent) => {
                if (this.closePromise.length) {
                    this.closePromise[0](event);
                    this.closePromise = [];
                }
            }

            this.ws.onmessage = (event: MessageEvent) => {
                const view = new DataView(event.data);
                const size = view.getUint32(0, true);
                const id = view.getUint16(4, true);
                const type = view.getUint8(6);
                const check = view.getUint8(7);

                if (type !== (255 - check)) {
                    console.error('Message type check error');
                    return;
                }

                let message: any = null;
                if (size) {
                    message = decode(event.data.slice(8));
                }

                if (type >= 16 && type <= 19 && id in this.pending) {
                    if (type === 19) this.pending[id].reject(message);
                    else this.pending[id].resolve(message);
                    delete this.pending[id];
                } else if (type in EventType) {
                    this.listeners.forEach(callback => {
                        callback(type as EventType, message);
                    });
                } else {
                    console.error("Unregistered event type: ", type);
                }
            }

            this.ws.onerror = (event: ErrorEvent) => {
                reject(event);
            }
        })
    }

    /**
     * Terminate websocket connection
     */
    public disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.closePromise = [resolve, reject];
            this.ws.close();
        })
    }

    /**
     * Authenticate user with credentials
     * @link https://docs.thingsdb.io/v1/connect/socket/auth/
     * @param username
     * @param password
     */
    public auth(username: string = 'admin', password: string = 'pass'): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(33, [username, password])] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Authenticate user with token
     * @link https://docs.thingsdb.io/v1/connect/socket/auth/
     * @param token
     */
    public authToken(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(33, token)] = { resolve: resolve, reject: reject };
        })
    }

    /**
     * Send a ping request - Can be used as keep-alive
     * @link https://docs.thingsdb.io/v1/connect/socket/ping/
     */
    public ping(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(32)] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Send a query request - Query ThingsDB
     * @link https://docs.thingsdb.io/v1/connect/socket/query/
     * @param scope
     * @param code
     * @param vars
     */
    public query(scope: string, code: string, vars?: {}): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(34, [scope, code, vars])] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Send a run request - Run a procedure in ThingsDB
     * @link https://docs.thingsdb.io/v1/connect/socket/run/
     * @param scope
     * @param procedure
     * @param args
     */
    public run(scope: string, procedure: string, args?: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(37, [scope, procedure, args])] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Send a join request - Join one or more rooms in a collection
     * @link https://docs.thingsdb.io/v1/connect/socket/join/
     * @param scope
     * @param ids
     */
    public join(scope: string, ...ids: number[]): Promise<(number|null)[]> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(38, [scope, ...ids])] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Send a leave request - Leave one or more joined rooms
     * @link https://docs.thingsdb.io/v1/connect/socket/leave/
     * @param scope
     * @param ids
     */
    public leave(scope: string, ...ids: number[]): Promise<(number|null)[]> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(39, [scope, ...ids])] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Send a emit request - Emit an event to a room in a collection
     * @link https://docs.thingsdb.io/v1/connect/socket/emit/
     * @param scope
     * @param roomId
     * @param event
     * @param args
     */
    public emit(scope: string, roomId: number, event: string, args: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(40, [scope, roomId, event, ...args])] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Send a emit to peers request - Emit an event to the peers in a room (no echo back)
     * @link https://docs.thingsdb.io/v1/connect/socket/emit/
     * @param scope
     * @param roomId
     * @param event
     * @param args
     * @since ThingsDB v1.8.0
     */
    public emitPeers(scope: string, roomId: number, event: string, args: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(41, [scope, roomId, event, ...args])] = { resolve: resolve, reject: reject };
        });
    }

    /**
     * Add listener for emitted packages in joined rooms
     * @link https://docs.thingsdb.io/v1/listening/
     * @param callback
     */
    public addEventListener(callback: (type: EventType, message: any) => void): void {
        this.removeEventListener(callback);
        this.listeners.add(callback);
    }

    /**
     * Remove listener
     * @param callback
     */
    public removeEventListener(callback: (type: EventType, message: any) => void): void {
        this.listeners.delete(callback);
    }

    private getNextId(): number {
        const id = this.id++;
        if (this.id > 65535) {
            this.id = 1;
        }
        return id;
    }

    private send(type: number, data: any = "") {
        const id = this.getNextId();
        let buffer: ArrayBuffer;
        let size: number = 0;
        if (data === "") {
            buffer = new ArrayBuffer(8);
        } else {
            const message = encode(data);
            size = message.byteLength;
            buffer = new ArrayBuffer(size + 8);
            new Uint8Array(buffer).set(message, 8);
        }

        const view = new DataView(buffer);
        view.setUint32(0, size, true);
        view.setUint16(4, id, true);
        view.setUint8(6, type);
        view.setUint8(7, ~type);

        this.ws.send(buffer);

        return id;
    }
}

export default ThingsDB;

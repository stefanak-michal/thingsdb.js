import { encode, decode } from "messagepack";
import EventType from "./EventType";
const WebSocketClient = require('websocket').w3cwebsocket;

class ThingsDB {
    private ws: typeof WebSocketClient;
    private id: number = 1;
    private readonly uri: string;
    private pending: { [index: number]: { resolve: (value: any) => void, reject: (value: any) => void }} = {};
    private listeners: ((type: number, message: any) => void)[] = [];

    constructor(uri: string = 'ws://127.0.0.1:7681') {
        this.uri = uri;
    }

    public connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocketClient(this.uri);
            this.ws.binaryType = "arraybuffer";

            this.ws.onopen = (event: Event) => {
                resolve(true);
            }

            this.ws.onclose = (event: CloseEvent) => {
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
                    for (const callback of this.listeners) callback(type as EventType, message);
                } else {
                    console.error("Unregistered event type: ", type);
                }
            }

            this.ws.onerror = (event: ErrorEvent) => {
                console.error("WebSocket error: ", event);
                reject(event);
            }
        })
    }

    public disconnect(): void {
        this.ws.close();
    }

    private getNextId(): number {
        const id = this.id++;
        if (this.id > 65535) {
            this.id = 1;
        }
        return id;
    }

    public auth(username: string = 'admin', password: string = 'pass'): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(33, [username, password])] = { resolve: resolve, reject: reject };
        });
    }

    public authToken(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(33, token)] = { resolve: resolve, reject: reject };
        })
    }

    public ping(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(32)] = { resolve: resolve, reject: reject };
        });
    }

    public query(scope: string, code: string, vars?: {}): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(34, [scope, code, vars])] = { resolve: resolve, reject: reject };
        });
    }

    public run(scope: string, procedure: string, args?: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(37, [scope, procedure, args])] = { resolve: resolve, reject: reject };
        });
    }

    public join(scope: string, ...ids: number[]): Promise<(number|null)[]> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(38, [scope, ...ids])] = { resolve: resolve, reject: reject };
        });
    }

    public leave(scope: string, ...ids: number[]): Promise<(number|null)[]> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(39, [scope, ...ids])] = { resolve: resolve, reject: reject };
        });
    }

    public emit(scope: string, roomId: number, event: string, args: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pending[this.send(40, [scope, roomId, event, ...args])] = { resolve: resolve, reject: reject };
        });
    }

    public addEventListener(callback: (type: EventType, message: any) => void): void {
        this.listeners.push(callback);
    }

    public removeEventListener(callback: (type: EventType, message: any) => void): void {
        const i = this.listeners.indexOf(callback);
        if (i >= 0) this.listeners.splice(i, 1);
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

        // console.log("WebSocket send: ", buffer);
        this.ws.send(buffer);

        return id;
    }
}

export default ThingsDB;

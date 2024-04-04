import { encode, decode } from "messagepack";
const WebSocketClient = require('websocket').w3cwebsocket;

class ThingsDB {
    private ws: WebSocket;
    private id: number = 1;
    private readonly uri: string;
    private pending: { [index: number]: { resolve: (value: any) => void, reject: (value: any) => void }} = {};

    constructor(uri: string = 'ws://127.0.0.1:9200') {
        this.uri = uri;
    }

    public connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocketClient(this.uri);

            this.ws.onopen = (event) => {
                console.log("WebSocket connected", event);
                resolve(true);
            }

            this.ws.onclose = (event) => {
                console.log("WebSocket closed", event);
            }

            this.ws.onmessage = (event) => {
                console.log("WebSocket message: ", event);

                const view = new DataView(event.data);
                const size = view.getUint32(0, true);
                const id = view.getInt16(4, true);
                const type = view.getUint8(6);
                const check = view.getUint8(7);

                if (type !== (255 - check)) {
                    console.error('Message type check error');
                    return;
                }

                let message: any = null;
                if (size) {
                    const buffer = new ArrayBuffer(size);
                    new Uint8Array(buffer).set(event.data.subarray(8));
                    message = decode(buffer);
                    console.log(message);
                }

                if (id in this.pending) {
                    if (type === 19) this.pending[id].reject(message);
                    else this.pending[id].resolve(message);
                    delete this.pending[id];
                }
            }

            this.ws.onerror = (event) => {
                console.error("WebSocket error: ", event);
                reject(event);
            }
        })
    }

    // todo check if ThingsDB means unsigned short ..because here it say only 16bit https://docs.thingsdb.io/v1/connect/socket/
    private getNextId(): number {
        const id = this.id++;
        if (this.id > 32767) {
            this.id = 1;
        }
        return id;
    }

    public auth(username: string = 'admin', password: string = 'pass'): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.send(33, [username, password]);
            this.pending[id] = { resolve: resolve, reject: reject };
        });
    }

    public ping(): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.send(32);
            this.pending[id] = { resolve: resolve, reject: reject };
        });
    }

    //todo
    //query
    //run
    //join
    //leave
    //emit


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
        view.setInt16(4, id, true);
        view.setUint8(6, type);
        view.setUint8(7, ~type);

        console.log("WebSocket send: ", buffer);
        this.ws.send(buffer);

        return id;
    }
}

export default ThingsDB;

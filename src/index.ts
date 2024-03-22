import { encode, decode } from "messagepack";
const WebSocketClient = require('websocket').w3cwebsocket;

class ThingsDB {
    private ws: WebSocket;
    private id: number = 1;
    private readonly uri: string;

    constructor(uri: string = 'ws://127.0.0.1:9200') {
        this.uri = uri;
    }

    public connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocketClient(this.uri);
            // this.ws.binaryType = "arraybuffer";
            this.ws.onopen = (event) => {
                console.log("WebSocket connected", event);
                resolve(true);
            }

            this.ws.onclose = (event) => {
                console.log("WebSocket closed", event);
            }

            this.ws.onmessage = (event) => {
                console.log("WebSocket message: ", event);
            }

            this.ws.onerror = (event) => {
                console.log("WebSocket error: ", event);
                reject(event);
            }
        })
    }

    private pending: { id: number; resolve: (value: any) => void, reject: (value: any) => void }[] = [];

    // todo check if ThingsDB means unsigned short ..because here it say only 16bit https://docs.thingsdb.io/v1/connect/socket/
    private getNextId(): number {
        const id = this.id;
        this.id++;
        if (this.id > 65535) {
            this.id = 1;
        }
        return id;
    }

    public auth(username: string = 'admin', password: string = 'pass'): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.send(33, [username, password]);
            this.pending.push({ id: id, resolve: resolve, reject: reject });
        });
    }

    public ping(): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.send(32);
            this.pending.push({id: id, resolve: resolve, reject: reject});
        });
    }

    private send(type: number, data: any = "") {
        const id = this.getNextId();
        let buffer: ArrayBuffer;
        let messageLength: number = 0;
        if (data === "") {
            buffer = new ArrayBuffer(8);
        } else {
            const message = encode(data);
            messageLength = message.byteLength;
            buffer = new ArrayBuffer(messageLength + 8);
            new Uint8Array(buffer).set(message, 8);
        }

        const view = new DataView(buffer);
        view.setUint32(0, messageLength, true);
        view.setUint16(4, id, true);
        view.setUint8(6, type);
        view.setUint8(7, type ^ 0xff);

        console.log("WebSocket send: ", view);
        this.ws.send(view);

        return id;
    }
}

export default ThingsDB;

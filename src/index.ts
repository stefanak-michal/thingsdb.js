import { encode, decode } from "messagepack";
import WebSocket from 'ws';

class ThingsDB {
    private ws: WebSocket;
    private id: number = 1;
    private readonly uri: string;

    constructor(uri: string = 'ws://127.0.0.1:9200') {
        this.uri = uri;
        // this.ws.onopen = (event: Event) => {
        //     console.log("WebSocket open: ", event);
        // };
        // todo create type T instead of any when you will learn more about message received from ThingsDB
        // this.ws.onmessage = (event: MessageEvent<any>) => {
        //     console.log("WebSocket message: ", event, decode(event.data));
        // };
        // this.ws.onerror = (event) => {
        //     console.error("WebSocket error: ", event);
        // };
        // this.ws.onclose = (event) => {
        //
        // };
    }

    public connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.uri);
            this.ws.binaryType = "arraybuffer";
            this.ws
                .on("open", () => {
                    console.log("WebSocket connected");
                    resolve(true);
                })
                .on("close", () => {
                    console.log("WebSocket closed");
                })
                .on("message", (data) => {
                    console.log("WebSocket message: ", data);
                })
                .on("error", (error) => {
                    console.error("WebSocket error: ", error);
                    reject(error);
                })
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

    public auth(username: string, password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.send(33, [username, password]);
            this.pending.push({ id, resolve, reject });
        });
    }

    private send(type: number, data: any) {
        const id = this.getNextId();
        const message = encode(data);
        const buffer = new ArrayBuffer(message.byteLength + 8);
        new Uint8Array(buffer).set(message, 8);

        const view = new DataView(buffer);
        view.setUint32(0, message.byteLength, true);
        view.setUint16(4, id, true);
        view.setUint8(5, type);
        view.setUint8(6, type ^ 0xff);

        console.log("WebSocket send: ", view);
        this.ws.send(view);

        return id;
    }
}

export default ThingsDB;

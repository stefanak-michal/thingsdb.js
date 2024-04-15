# ThingsDB.js

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z5ABMLW)

## Description

This project provides a JavaScript connector library that enables seamless interaction with [ThingsDB](https://www.thingsdb.io/), from both backend
and frontend environments. It simplifies data access, manipulation, and querying for developers using JavaScript.

## :white_check_mark: Requirements

- ThingsDB [v1.6.0](https://docs.thingsdb.io/v1/)
- Javascript

## :floppy_disk: Instalation

This library is available for both frontend and backend. You should choose installation method by your need.

### browser

Package is automatically available at unpkg. You can find latest version of package at https://unpkg.com/thingsdb.js@latest/dist/thingsdb.js

Add this into your html head:

```html

<script src="https://unpkg.com/thingsdb.js@latest/dist/thingsdb.js"></script>
```

### npm

Package is available at npm https://www.npmjs.com/package/thingsdb.js

Run this command to install package into your project:

`npm i thingsdb.js`

## :desktop_computer: Usage

Class `ThingsDB` provide all functionality related to websocket connection with ThingsDB. It contains set of method which are based on documentation.
Every method has comment (annotation) with required information and link to documentation. //not yet

### Available methods

| Method              | Description                                                                   | Returns                                                                                                                                                      |
|---------------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| __construct         | ThingsDB constructor                                                          | ThingsDB instance                                                                                                                                            |
| connect             | Initialize websocket connection                                               | `Promise<void>`                                                                                                                                              |
| disconnect          | Close websocket connection                                                    | `Promise<void>`                                                                                                                                              |
| ping                | Ping, useful as keep-alive                                                    | `Promise<void>`                                                                                                                                              |
| auth                | Authorization with username and password                                      | `Promise<void>`                                                                                                                                              |
| authToken           | Authorization with token                                                      | `Promise<void>`                                                                                                                                              |
| query               | Query ThingsDB                                                                | `Promise<any>`                                                                                                                                               |
| run                 | Run a procedure                                                               | `Promise<any>`                                                                                                                                               |
| join                | Join one or more room(s)                                                      | `Promise<(number\|null)[]>` - Array as requested ids to connect. Successful join returns same id at the same index. Unsuccessful returns null at that index. |
| leave               | Leave one or more room(s)                                                     | `Promise<(number\|null)[]>` - Same as join.                                                                                                                  |
| emit                | Emit an event to a room                                                       | `Promise<void>`                                                                                                                                              |
| addEventListener    | Add listener for events - callback: `(type: EventType, message: any) => void` | `void`                                                                                                                                                       |
| removeEventListener | Remove listener for events                                                    | `void`                                                                                                                                                       |

### Listening

Listening is specific state in which you listen for emitted packages from ThingsDB. You can read more about it in [docs](https://docs.thingsdb.io/v1/listening/).

`join`, `emit`, `leave` also emit package towards the one who did it. Therefore, don't be surprised when first package received with your registered event listener will
be `ON_JOIN|ON_LEAVE|ON_EMIT` event type.

### Event types

- NODE_STATUS = 0,
- WARNING = 5,
- ON_JOIN = 6,
- ON_LEAVE = 7,
- ON_EMIT = 8,
- ON_DELETE = 9

_Also available as enum EventType for typescript._

### Example

```javascript
const thingsdb = new ThingsDB();
thingsdb.connect().then(() => {
    thingsdb.auth().then(() => {
        thingsdb.query('@:stuff', '"Hello World!";').then(response => {
            console.log(response); // will be "Hello World!"
        });
    });
});
```

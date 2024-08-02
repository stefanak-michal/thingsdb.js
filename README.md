# ThingsDB.js


[![Github stargazers](https://img.shields.io/github/stars/stefanak-michal/thingsdb.js)](https://github.com/stefanak-michal/thingsdb.js/stargazers)
[![NPM Downloads](https://img.shields.io/npm/dm/thingsdb.js)](https://www.npmjs.com/package/thingsdb.js)
[![GitHub Release](https://img.shields.io/github/v/release/stefanak-michal/thingsdb.js)](https://github.com/stefanak-michal/thingsdb.js/releases/latest)
[![GitHub commits since latest release](https://img.shields.io/github/commits-since/stefanak-michal/thingsdb.js/latest)](https://github.com/stefanak-michal/thingsdb.js/releases/latest)

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/stefanak-michal/thingsdb.js/.github%2Fworkflows%2Fjest.yml?label=Jest)](https://github.com/stefanak-michal/thingsdb.js/actions/workflows/jest.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/stefanak-michal/thingsdb.js/.github%2Fworkflows%2Fplaywright.yml?label=Playwright)](https://github.com/stefanak-michal/thingsdb.js/actions/workflows/playwright.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/stefanak-michal/thingsdb.js/.github%2Fworkflows%2Fnpm-publish.yml?label=npm%20publish)](https://github.com/stefanak-michal/thingsdb.js/actions/workflows/npm-publish.yml)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z5ABMLW)

## Description

This project provides a JavaScript connector library that enables seamless interaction with [ThingsDB](https://www.thingsdb.io/), from both backend
and frontend environments. It simplifies data access, manipulation, and querying for developers using JavaScript.

## :white_check_mark: Requirements

- ThingsDB [v1](https://docs.thingsdb.io/v1/) with enabled [websocket](https://docs.thingsdb.io/v1/connect/websocket/)
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

| Method              | Arguments                                                      | Description                              | Returns                                                                                                                                                      |
|---------------------|----------------------------------------------------------------|------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| __construct         | uri: string = 'ws://127.0.0.1:9270'                            | ThingsDB constructor                     | ThingsDB instance                                                                                                                                            |
| connect             |                                                                | Initialize websocket connection          | `Promise<void>`                                                                                                                                              |
| disconnect          |                                                                | Close websocket connection               | `Promise<void>`                                                                                                                                              |
| ping                |                                                                | Ping, useful as keep-alive               | `Promise<void>`                                                                                                                                              |
| auth                | username: string = 'admin', password: string = 'pass'          | Authorization with username and password | `Promise<void>`                                                                                                                                              |
| authToken           | token: string                                                  | Authorization with token                 | `Promise<void>`                                                                                                                                              |
| query               | scope: string, code: string, vars?: {}                         | Query ThingsDB                           | `Promise<any>`                                                                                                                                               |
| run                 | scope: string, procedure: string, args?: any[]                 | Run a procedure                          | `Promise<any>`                                                                                                                                               |
| join                | scope: string, ...ids: number[]                                | Join one or more room(s)                 | `Promise<(number\|null)[]>` - Array as requested ids to connect. Successful join returns same id at the same index. Unsuccessful returns null at that index. |
| leave               | scope: string, ...ids: number[]                                | Leave one or more room(s)                | `Promise<(number\|null)[]>` - Same as join.                                                                                                                  |
| emit                | scope: string, roomId: number, event: string, args: any[] = [] | Emit an event to a room                  | `Promise<void>`                                                                                                                                              |
| addEventListener    | callback: (type: EventType, message: any) => void              | Add listener for events                  | `void`                                                                                                                                                       |
| removeEventListener | callback: (type: EventType, message: any) => void              | Remove listener for events               | `void`                                                                                                                                                       |

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

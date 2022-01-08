/* eslint-disable id-length*/
import Test from 'ava';
import {connectWS} from '../ws.js';

const console = dispatches => ({
    log: value => dispatches.push(['console.log', value]),
});
const WebSocketSuccess = message => dispatches => function (...values) {
    dispatches.push(['new WebSocket', ...values]);
    
    this.on = (event, callback) => {
        if (event !== 'error') {
            dispatches.push(['WebSocket.on', event]);
            callback(message);
        }
    };
};
const WebSocketError = error => dispatches => function (...values) {
    dispatches.push(['new WebSocket', ...values]);
    
    this.on = (event, callback) => {
        if (event !== 'close' && event !== 'message') {
            dispatches.push(['WebSocket.on', event]);
            callback(error);
        }
    };
};
const WebSocketThrow = error => dispatches => function (...values) {
    dispatches.push(['new WebSocket', ...values]);

    throw error;
};

Test('Успешное подключение к websocket', async t => {
    const dispatches = [];
    
    await connectWS({
        WebSocket: WebSocketSuccess('{"data": "data"}')(dispatches),
        console: console(dispatches),
    })('cookie', value => dispatches.push(['on.message', value]));
    
    t.deepEqual(dispatches, [
        ['new WebSocket', 'wss://ws.cs.money/ws', {
            headers: {
                Origin: 'https://old.cs.money/',
                Cookie: 'cookie',
            },
        }],
        ['WebSocket.on', 'open'],
        ['console.log', 'WS открыт...'],
        ['WebSocket.on', 'message'],
        ['on.message', {data: 'data'}],
        ['WebSocket.on', 'close'],
    ]);
});

Test('Неуспешное подключение к websocket', async t => {
    const dispatches = [];
    
    const error = await t.throwsAsync(async () => await connectWS({
        WebSocket: WebSocketError(new Error('error'))(dispatches),
        console: console(dispatches),
    })('cookie', value => dispatches.push(['on.message', value])));
    
    dispatches.push(['throw', error.message]);
    
    t.deepEqual(dispatches, [
        ['new WebSocket', 'wss://ws.cs.money/ws', {
            headers: {
                Origin: 'https://old.cs.money/',
                Cookie: 'cookie',
            },
        }],
        ['WebSocket.on', 'open'],
        ['console.log', 'WS открыт...'],
        ['WebSocket.on', 'error'],
        ['throw', 'error'],
    ]);
});

Test('Неуспешное подключение к websocket в try catch', async t => {
    const dispatches = [];
    
    const error = await t.throwsAsync(async () => await connectWS({
        WebSocket: WebSocketThrow(new Error('error'))(dispatches),
        console: console(dispatches),
    })('cookie', value => dispatches.push(['on.message', value])));
    
    dispatches.push(['throw', error.message]);
    
    t.deepEqual(dispatches, [
        ['new WebSocket', 'wss://ws.cs.money/ws', {
            headers: {
                Origin: 'https://old.cs.money/',
                Cookie: 'cookie',
            },
        }],
        ['console.log', 'Произошла непредвиденная ошибка: error'],
        ['throw', 'error'],
    ]);
});
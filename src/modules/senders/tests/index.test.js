/* eslint-disable id-length*/
import Test from 'ava';
import * as senders from '../index.js';

Test('Пакет экспортирует верное кол-во частей', t => {
    t.is(Object.keys(senders).length, 3);
});

Test('Пакет экспортирует get', t => {
    t.true('get' in senders);
});

Test('Пакет экспортирует post', t => {
    t.true('post' in senders);
});

Test('Пакет экспортирует ws', t => {
    t.true('ws' in senders);
});

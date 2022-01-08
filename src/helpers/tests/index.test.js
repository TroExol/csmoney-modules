/* eslint-disable id-length*/
import Test from 'ava';
import * as helpers from '../index.js';

Test('Пакет экспортирует верное кол-во частей', t => {
    t.is(Object.keys(helpers).length, 4);
});

Test('Пакет экспортирует isObject', t => {
    t.true('isObject' in helpers);
});

Test('Пакет экспортирует input', t => {
    t.true('input' in helpers);
});

Test('Пакет экспортирует unstackItems', t => {
    t.true('unstackItems' in helpers);
});

Test('Пакет экспортирует defaultSetting', t => {
    t.true('defaultSetting' in helpers);
});

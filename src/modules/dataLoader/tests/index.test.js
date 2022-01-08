/* eslint-disable id-length*/
import Test from 'ava';
import * as dataLoader from '../index.js';

Test('Пакет экспортирует верное кол-во частей', t => {
    t.is(Object.keys(dataLoader).length, 6);
});

Test('Пакет экспортирует balance', t => {
    t.true('balance' in dataLoader);
});

Test('Пакет экспортирует itemNames', t => {
    t.true('itemNames' in dataLoader);
});

Test('Пакет экспортирует myInventory', t => {
    t.true('myInventory' in dataLoader);
});

Test('Пакет экспортирует itemStatus', t => {
    t.true('itemStatus' in dataLoader);
});

Test('Пакет экспортирует salesHistory', t => {
    t.true('salesHistory' in dataLoader);
});

Test('Пакет экспортирует botInventoryLoader', t => {
    t.true('botInventoryLoader' in dataLoader);
});

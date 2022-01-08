/* eslint-disable id-length*/
import Test from 'ava';
import {botInventoryLoader} from '../botInventory.js';

const console = dispatches => ({
    log: (...values) => dispatches.push(['console.log', ...values]),
});

const getSuccess = response => dispatches => (...values) => {
    dispatches.push(['get', ...values]);
    return Promise.resolve(response);
};

const getError = dispatches => (...values) => {
    dispatches.push(['get', ...values]);
    return Promise.reject('error');
};

Test('Успешное получение инвентаря бота', async t => {
    const dispatches = [];
    
    const response = await botInventoryLoader({
        get: getSuccess([1])(dispatches),
        console: console(dispatches),
    })(730);
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_bots_inventory'],
        ['response', [1]],
    ]);
});

Test('Успешное получение инвентаря бота при ответе != array', async t => {
    const dispatches = [];
    
    const response = await botInventoryLoader({
        get: getSuccess('data')(dispatches),
        console: console(dispatches),
    })(730);
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_bots_inventory'],
        ['console.log', 'Не удалось получить данные инвентаря бота игры 730', 'data'],
        ['response', []],
    ]);
});

Test('Неуспешное получение инвентаря бота', async t => {
    const dispatches = [];
    
    const response = await botInventoryLoader({
        get: getError(dispatches),
        console: console(dispatches),
    })(730);
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_bots_inventory'],
        ['console.log', 'Ошибка при получении предметов бота игры 730', 'error'],
        ['response', []],
    ]);
});

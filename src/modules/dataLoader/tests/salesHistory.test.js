/* eslint-disable id-length*/
import Test from 'ava';
import {salesHistory} from '../salesHistory.js';

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

const myDate = timestamp => ({
    now: () => timestamp,
});

Test('Должно присутствовать поле 730', t => {
    t.assert(salesHistory({
        get: getSuccess,
        console,
        Date,
    })[730]);
});

Test('Должно присутствовать поле 570', t => {
    t.assert(salesHistory({
        get: getSuccess,
        console,
        Date,
    })[570]);
});

Test('Успешная загрузка истории', async t => {
    const dispatches = [];
    
    const date = 2592000000; // 30 дней в миллисекундах
    
    const injectedSalesHistory = salesHistory({
        get: getSuccess([1])(dispatches),
        console: console(dispatches),
        Date: myDate(date),
    });
    
    const response = await injectedSalesHistory.load(730, 1);
    
    dispatches.push(['response', response]);
    
    dispatches.push(['salesHistory', injectedSalesHistory[730]]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/market_sales', {
            appId: 730,
            nameId: 1,
            start_time: 0,
        }],
        ['response', [1]],
        ['salesHistory', {
            1: {
                timeLoad: date,
                history: [1],
            },
        }],
    ]);
});

Test('Успешная загрузка истории без данных', async t => {
    const dispatches = [];
    
    const date = 2592000000; // 30 дней в миллисекундах
    
    const injectedSalesHistory = salesHistory({
        get: getSuccess(null)(dispatches),
        console: console(dispatches),
        Date: myDate(date),
    });
    
    const response = await injectedSalesHistory.load(730, 1);
    
    dispatches.push(['response', response]);
    
    dispatches.push(['salesHistory', injectedSalesHistory[730]]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/market_sales', {
            appId: 730,
            nameId: 1,
            start_time: 0,
        }],
        ['console.log', 'Не удалось получить историю покупок appId: 730 itemNameId: 1', null],
        ['response', []],
        ['salesHistory', {}],
    ]);
});

Test('Неуспешная загрузка истории', async t => {
    const dispatches = [];
    
    const date = 2592000000; // 30 дней в миллисекундах
    
    const injectedSalesHistory = salesHistory({
        get: getError(dispatches),
        console: console(dispatches),
        Date: myDate(date),
    });
    
    const response = await injectedSalesHistory.load(730, 1);
    
    dispatches.push(['response', response]);
    
    dispatches.push(['salesHistory', injectedSalesHistory[730]]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/market_sales', {
            appId: 730,
            nameId: 1,
            start_time: 0,
        }],
        ['console.log', 'Ошибка при получении истории покупок appId: 730 itemNameId: 1', 'error'],
        ['response', []],
        ['salesHistory', {}],
    ]);
});

Test('Получение истории работает верно', async t => {
    const dispatches = [];
    
    const date = 2592000000; // 30 дней в миллисекундах
    
    const injectedSalesHistory = salesHistory({
        get: getSuccess(null)(dispatches),
        console: console(dispatches),
        Date: myDate(date),
    });
    
    injectedSalesHistory[730][1] = {
        timeLoad: date,
        history: 'history',
    };
    
    const response = await injectedSalesHistory.get(730, 1);
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['response', 'history'],
    ]);
});

Test('Получение истории работает верно при отсутствии данных о предмете', async t => {
    const dispatches = [];
    
    const date = 2592000000; // 30 дней в миллисекундах
    
    const injectedSalesHistory = salesHistory({
        get: getSuccess([1])(dispatches),
        console: console(dispatches),
        Date: myDate(date),
    });
    
    const response = await injectedSalesHistory.get(730, 1);
    
    dispatches.push(['response', response]);
    dispatches.push(['salesHistory', injectedSalesHistory[730]]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/market_sales', {
            appId: 730,
            nameId: 1,
            start_time: 0,
        }],
        ['response', [1]],
        ['salesHistory', {
            1: {
                timeLoad: date,
                history: [1],
            },
        }],
    ]);
});

Test('Получение истории работает верно при просроченных данных о предмете', async t => {
    const dispatches = [];
    
    const date = 2592000000; // 30 дней в миллисекундах
    
    const injectedSalesHistory = salesHistory({
        get: getSuccess([1])(dispatches),
        console: console(dispatches),
        Date: myDate(date * 2.1),
    });
    
    injectedSalesHistory[730][1] = {
        timeLoad: date,
        history: 'history',
    };
    
    const response = await injectedSalesHistory.get(730, 1);
    
    dispatches.push(['response', response]);
    dispatches.push(['salesHistory', injectedSalesHistory[730]]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/market_sales', {
            appId: 730,
            nameId: 1,
            start_time: 2851200,
        }],
        ['response', [1]],
        ['salesHistory', {
            1: {
                timeLoad: date * 2.1,
                history: [1],
            },
        }],
    ]);
});
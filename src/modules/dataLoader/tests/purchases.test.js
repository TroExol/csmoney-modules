/* eslint-disable id-length*/
import Test from 'ava';
import {purchasesLoader} from '../purchases.js';

const console = dispatches => ({
    log: (...values) => dispatches.push(['console.log', ...values]),
});
const setTimeout = dispatches => (callback, timeout) => dispatches.push(['setTimeout', callback.toString(), timeout]);

const getSuccess = response => dispatches => (...values) => {
    dispatches.push(['get', ...values]);
    return Promise.resolve(response);
};

const getError = dispatches => (...values) => {
    dispatches.push(['get', ...values]);
    return Promise.reject('error');
};

Test('Должно присутствовать поле accounts', t => {
    t.assert(purchasesLoader({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).accounts);
});

Test('Получение покупок и продаж работает верно', t => {
    const injectedPurchases = purchasesLoader({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedPurchases.accounts.key = 'purchases';
    t.is(injectedPurchases.get('key'), 'purchases');
});

Test('Успешная загрузка', async t => {
    const dispatches = [];
    
    const injectedPurchases = purchasesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess([{id: 1}])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedPurchases.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['purchases', injectedPurchases.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_purchases', null, 'cookie'],
        ['purchases', [{id: 1}]],
    ]);
});

Test('Успешная загрузка с дефолтными параметрами ', async t => {
    const dispatches = [];
    
    const injectedPurchases = purchasesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess([{id: 1}])(dispatches),
        console: console(dispatches),
        defaultSetting: {
            repeatLoad: {
                purchases: {
                    status: false,
                    delay: 0,
                },
            },
            keyAccounts: ['key'],
        },
    });
    
    await injectedPurchases.load({key: 'cookie'});
    
    dispatches.push(['purchases', injectedPurchases.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_purchases', null, 'cookie'],
        ['purchases', [{id: 1}]],
    ]);
});

Test('Успешная загрузка с повторной загрузкой', async t => {
    const dispatches = [];
    
    const injectedPurchases = purchasesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess([{id: 1}])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedPurchases.load({key: 'cookie'}, {status: true, delay: 60000}, ['key']);
    
    const loadParams = injectedPurchases.load.toString()
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',').map(param => param.split('=')[0].trim());
    const recursiveLoadParams = dispatches.find(dispatch => dispatch[0] === 'setTimeout')[1]
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',')
        .map(param => param.split('=')[0].trim());
    
    t.deepEqual(loadParams, recursiveLoadParams);
    
    dispatches.push(['purchases', injectedPurchases.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_purchases', null, 'cookie'],
        ['setTimeout', '() => this.load(cookie, repeatLoad, requiredAccounts)', 60000],
        ['purchases', [{id: 1}]],
    ]);
});

Test('Успешная загрузка без покупок и продаж', async t => {
    const dispatches = [];
    
    const injectedPurchases = purchasesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess(null)(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedPurchases.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['purchases', injectedPurchases.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_purchases', null, 'cookie'],
        ['purchases', undefined],
    ]);
});

Test('Неуспешная загрузка', async t => {
    const dispatches = [];
    
    const injectedPurchases = purchasesLoader({
        setTimeout: setTimeout(dispatches),
        get: getError(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedPurchases.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['purchases', injectedPurchases.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_purchases', null, 'cookie'],
        ['console.log', 'Ошибка при получении списка покупок и продаж', 'error'],
        ['purchases', undefined],
    ]);
});
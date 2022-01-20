/* eslint-disable id-length*/
import Test from 'ava';
import {transactionsLoader} from '../transactions.js';

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
    t.assert(transactionsLoader({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).accounts);
});

Test('Получение транзакций работает верно', t => {
    const injectedTransactions = transactionsLoader({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedTransactions.accounts.key = 'transactions';
    t.is(injectedTransactions.get('key'), 'transactions');
});

Test('Успешная загрузка', async t => {
    const dispatches = [];
    
    const injectedTransactions = transactionsLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess([{id: 1}])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedTransactions.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['transactions', injectedTransactions.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_transactions', null, 'cookie'],
        ['transactions', [{id: 1}]],
    ]);
});

Test('Успешная загрузка с дефолтными параметрами ', async t => {
    const dispatches = [];
    
    const injectedTransactions = transactionsLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess([{id: 1}])(dispatches),
        console: console(dispatches),
        defaultSetting: {
            repeatLoad: {
                transactions: {
                    status: false,
                    delay: 0,
                },
            },
            keyAccounts: ['key'],
        },
    });
    
    await injectedTransactions.load({key: 'cookie'});
    
    dispatches.push(['transactions', injectedTransactions.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_transactions', null, 'cookie'],
        ['transactions', [{id: 1}]],
    ]);
});

Test('Успешная загрузка с повторной загрузкой', async t => {
    const dispatches = [];
    
    const injectedTransactions = transactionsLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess([{id: 1}])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedTransactions.load({key: 'cookie'}, {status: true, delay: 60000}, ['key']);
    
    const loadParams = injectedTransactions.load.toString()
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',').map(param => param.split('=')[0].trim());
    const recursiveLoadParams = dispatches.find(dispatch => dispatch[0] === 'setTimeout')[1]
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',')
        .map(param => param.split('=')[0].trim());
    
    t.deepEqual(loadParams, recursiveLoadParams);
    
    dispatches.push(['transactions', injectedTransactions.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_transactions', null, 'cookie'],
        ['setTimeout', '() => this.load(cookie, repeatLoad, requiredAccounts)', 60000],
        ['transactions', [{id: 1}]],
    ]);
});

Test('Успешная загрузка без транзакций', async t => {
    const dispatches = [];
    
    const injectedTransactions = transactionsLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess(null)(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedTransactions.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['transactions', injectedTransactions.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_transactions', null, 'cookie'],
        ['transactions', undefined],
    ]);
});

Test('Неуспешная загрузка', async t => {
    const dispatches = [];
    
    const injectedTransactions = transactionsLoader({
        setTimeout: setTimeout(dispatches),
        get: getError(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedTransactions.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['transactions', injectedTransactions.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/get_transactions', null, 'cookie'],
        ['console.log', 'Ошибка при получении списка транзакций', 'error'],
        ['transactions', undefined],
    ]);
});
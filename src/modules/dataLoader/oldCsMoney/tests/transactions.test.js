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

Test('Получение списка offerId в статусе ожидания подтверждения работает верно', async t => {
    let injectedTransactions = transactionsLoader({
        setTimeout,
        get: getSuccess([
            {
                1: {
                    trades: [
                        {
                            offer_id: 3,
                            status: 'pending',
                            time: Date.now(),
                        },
                    ],
                },
                2: {
                    trades: [
                        {
                            offer_id: 4,
                            status: 'completed',
                            time: Date.now(),
                        },
                    ],
                },
            },
            {
                3: {},
                4: {
                    trades: [],
                },
                5: {
                    trades: [
                        {
                            offer_id: 5,
                            status: 'completed',
                            time: (Date.now() - 60 * 60000) / 1000,
                        },
                    ],
                },
            },
        ])([]),
        console,
        defaultSetting: {},
    });
    t.deepEqual(await injectedTransactions.getPendingOfferIds({key: 'cookie'}, 'key'), [3]);
    
    injectedTransactions = transactionsLoader({
        setTimeout,
        get: getSuccess([
            {
                1: {
                    trades: [
                        {
                            offer_id: 3,
                            status: 'pending',
                            time: Date.now(),
                        },
                    ],
                },
            },
        ])([]),
        console,
        defaultSetting: {},
    });
    t.deepEqual(await injectedTransactions.getPendingOfferIds({key: 'cookie'}, 'key1'), [3]);
});

Test('Получение списка offerId в статусе ожидания подтверждения работает верно при отсутствии данных', async t => {
    const injectedTransactions = transactionsLoader({
        setTimeout,
        get: getSuccess()([]),
        console,
        defaultSetting: {},
    });
    t.deepEqual(await injectedTransactions.getPendingOfferIds({key: 'cookie'}, 'key2'), undefined);
});

Test('Получение offerId по id обмена работает верно', async t => {
    const dispatches = [];
    
    const injectedTransactions = transactionsLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess([{
            1: {
                trades: [
                    {
                        merchant_id: 1,
                        offer_id: 3,
                    },
                ],
            },
            2: {
                trades: [
                    {
                        merchant_id: 2,
                        offer_id: 4,
                    },
                ],
            },
        }])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    t.is(await injectedTransactions.getOfferId({key: 'cookie'}, 'key', 2), 4);
    t.is(await injectedTransactions.getOfferId({key: 'cookie'}, 'key', 3), undefined);
});

Test('Получение offerId по id обмена при пустой загрузке работает верно', async t => {
    const dispatches = [];
    
    const injectedTransactions = transactionsLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess(null)(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    t.is(await injectedTransactions.getOfferId({key: 'cookie'}, 'key', 1), undefined);
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
            getAccountIds: () => ['key'],
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
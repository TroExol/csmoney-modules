/* eslint-disable id-length*/
import Test from 'ava';
import {myBalance} from '../balance.js';

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
    t.assert(myBalance({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).accounts);
});

Test('Уменьшение баланса работает верно', t => {
    const injectedBalance = myBalance({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 100;
    injectedBalance.decrease('key', 20);
    t.is(injectedBalance.accounts.key, 80);
});

Test('Увеличение баланса работает верно', t => {
    const injectedBalance = myBalance({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 100;
    injectedBalance.increase('key', 20);
    t.is(injectedBalance.accounts.key, 120);
});

Test('Получение баланса работает верно', t => {
    const injectedBalance = myBalance({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 100;
    t.is(injectedBalance.get('key'), 100);
    t.deepEqual(injectedBalance.get(), {key: 100});
});

Test('Успешная загрузка баланса', async t => {
    const dispatches = [];
    
    const injectedBalance = myBalance({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({balance: 100})(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 0;
    
    await injectedBalance.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['balance', injectedBalance.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/user_info', null, 'cookie'],
        ['balance', 100],
    ]);
});

Test('Успешная загрузка баланса с дефолтными параметрами ', async t => {
    const dispatches = [];
    
    const injectedBalance = myBalance({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({balance: 100})(dispatches),
        console: console(dispatches),
        defaultSetting: {
            repeatLoad: {
                balance: {
                    status: false,
                    delay: 0,
                },
            },
            keyAccounts: ['key'],
        },
    });
    injectedBalance.accounts.key = 0;
    
    await injectedBalance.load({key: 'cookie'});
    
    dispatches.push(['balance', injectedBalance.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/user_info', null, 'cookie'],
        ['balance', 100],
    ]);
});

Test('Успешная загрузка баланса с повторной загрузкой', async t => {
    const dispatches = [];
    
    const injectedBalance = myBalance({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({balance: 100})(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 0;
    
    await injectedBalance.load({key: 'cookie'}, {status: true, delay: 60000}, ['key']);
    
    dispatches.push(['balance', injectedBalance.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/user_info', null, 'cookie'],
        ['setTimeout', '() => this.load(cookie, repeatLoad, requiredAccounts)', 60000],
        ['balance', 100],
    ]);
});

Test('Успешная загрузка баланса без баланса', async t => {
    const dispatches = [];
    
    const injectedBalance = myBalance({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({})(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 0;
    
    await injectedBalance.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['balance', injectedBalance.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/user_info', null, 'cookie'],
        ['balance', 0],
    ]);
});

Test('Успешная загрузка баланса с балансом 0', async t => {
    const dispatches = [];
    
    const injectedBalance = myBalance({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({balance: 0})(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 0;
    
    await injectedBalance.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['balance', injectedBalance.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/user_info', null, 'cookie'],
        ['balance', 0],
    ]);
});

Test('Неуспешная загрузка баланса', async t => {
    const dispatches = [];
    
    const injectedBalance = myBalance({
        setTimeout: setTimeout(dispatches),
        get: getError(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedBalance.accounts.key = 0;
    
    await injectedBalance.load({key: 'cookie'}, {status: false, delay: 0}, ['key']);
    
    dispatches.push(['balance', injectedBalance.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/user_info', null, 'cookie'],
        ['console.log', 'Ошибка при обновлении баланса', 'error'],
        ['balance', 0],
    ]);
});
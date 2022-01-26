/* eslint-disable id-length*/
import Test from 'ava';
import {itemNamesLoader} from '../itemNames.js';

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

Test('Должно присутствовать поле nameId', t => {
    t.assert(itemNamesLoader({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).nameId);
});

Test('Получение работает верно', t => {
    const injectedItemNames = itemNamesLoader({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedItemNames.nameId[730] = {
        '1': {m: 'name'},
    };
    t.deepEqual(injectedItemNames.get(730), {
        '1': {m: 'name'},
    });
    t.deepEqual(injectedItemNames.get(), {
        730: {
            '1': {m: 'name'},
        },
        570: undefined,
    });
});

Test('Успешная загрузка названий', async t => {
    const dispatches = [];
    
    const injectedItemNames = itemNamesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess('1 = {"1": {"m": "name"}}')(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemNames.load('en', {status: false, delay: 0}, [730]);
    
    dispatches.push(['itemNames', injectedItemNames.nameId]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/js/database-skins/library-en-730.js'],
        ['itemNames', {
            730: {
                '1': {m: 'name'},
            },
            570: undefined,
        }],
    ]);
});

Test('Успешная загрузка названий с дефолтными параметрами ', async t => {
    const dispatches = [];
    
    const injectedItemNames = itemNamesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess('1 = {"1": {"m": "name"}}')(dispatches),
        console: console(dispatches),
        defaultSetting: {
            repeatLoad: {
                itemNames: {
                    status: false,
                    delay: 0,
                },
            },
            appIdList: [730],
            languageName: 'en',
        },
    });
    
    await injectedItemNames.load();
    
    dispatches.push(['itemNames', injectedItemNames.nameId]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/js/database-skins/library-en-730.js'],
        ['itemNames', {
            730: {
                '1': {m: 'name'},
            },
            570: undefined,
        }],
    ]);
});

Test('Успешная загрузка названий с повторной загрузкой', async t => {
    const dispatches = [];
    
    const injectedItemNames = itemNamesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess('1 = {"1": {"m": "name"}}')(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemNames.load('en', {status: true, delay: 60000}, [730]);
    
    const loadParams = injectedItemNames.load.toString()
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',').map(param => param.split('=')[0].trim());
    const recursiveLoadParams = dispatches.find(dispatch => dispatch[0] === 'setTimeout')[1]
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',')
        .map(param => param.split('=')[0].trim());
    
    t.deepEqual(loadParams, recursiveLoadParams);
    
    dispatches.push(['itemNames', injectedItemNames.nameId]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/js/database-skins/library-en-730.js'],
        ['setTimeout', '() => this.load(language, repeatLoad, appIdList)', 60000],
        ['itemNames', {
            730: {
                '1': {m: 'name'},
            },
            570: undefined,
        }],
    ]);
});

Test('Успешная загрузка названий без данных', async t => {
    const dispatches = [];
    
    const injectedItemNames = itemNamesLoader({
        setTimeout: setTimeout(dispatches),
        get: getSuccess(null)(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemNames.load('en', {status: false, delay: 0}, [730]);
    
    dispatches.push(['itemNames', injectedItemNames.nameId]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/js/database-skins/library-en-730.js'],
        ['itemNames', {
            730: {},
            570: undefined,
        }],
    ]);
});

Test('Неуспешная загрузка названий', async t => {
    const dispatches = [];
    
    const injectedItemNames = itemNamesLoader({
        setTimeout: setTimeout(dispatches),
        get: getError(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemNames.load('en', {status: false, delay: 0}, [730]);
    
    dispatches.push(['itemNames', injectedItemNames.nameId]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/js/database-skins/library-en-730.js'],
        ['console.log', 'Ошибка при получении списка названий предметов CS:GO / DOTA2', 'error'],
        ['itemNames', {
            730: undefined,
            570: undefined,
        }],
    ]);
});
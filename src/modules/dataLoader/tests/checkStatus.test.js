/* eslint-disable id-length*/
import Test from 'ava';
import {itemStatus} from '../checkStatus.js';

const console = dispatches => ({
    log: (...values) => dispatches.push(['console.log', ...values]),
});
const setTimeout = dispatches => (callback, timeout) => dispatches.push(['setTimeout', callback.toString(), timeout]);

const getSuccess = response => dispatches => value => {
    dispatches.push(['get', value]);
    return Promise.resolve(value?.includes('list_overstock')
        ? response.overstocks
        : response.unavailable);
};

const getError = dispatches => value => {
    dispatches.push(['get', value]);
    return Promise.reject('error');
};

Test('Должно присутствовать поле status', t => {
    t.plan(3);
    
    t.assert(itemStatus({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).status);
    
    t.assert(itemStatus({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).status[730]);
    
    t.assert(itemStatus({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).status[570]);
});

Test('Получение работает верно', t => {
    const injectedItemStatus = itemStatus({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    t.deepEqual(injectedItemStatus.get(730), {});
    t.deepEqual(injectedItemStatus.get(), {
        730: {},
        570: {},
    });
});

Test('Проверка работает верно', t => {
    const injectedItemStatus = itemStatus({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedItemStatus.status[730] = {
        'name1': 'Unavailable',
        'name2': -7,
    };
    t.is(injectedItemStatus.check('name1', 730, -5), false);
    t.is(injectedItemStatus.check('name2', 730, -5), false);
    t.is(injectedItemStatus.check('name2', 730, -10), -7);
    t.is(injectedItemStatus.check('name3', 730, -5), true);
});

Test('Проверка работает верно с дефолтными параметрами', t => {
    const injectedItemStatus = itemStatus({
        setTimeout,
        get: getSuccess,
        console,
        defaultSetting: {
            limitOverstock: -5,
        },
    });
    injectedItemStatus.status[730] = {
        'name': -6,
    };
    t.is(injectedItemStatus.check('name', 730), false);
});

Test('Успешная загрузка статусов', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({
            overstocks: [
                {
                    market_hash_name: 'name1',
                    overstock_difference: -1,
                },
                {
                    market_hash_name: 'name2',
                    overstock_difference: -1,
                },
            ],
            unavailable: [
                {
                    market_hash_name: 'name1',
                },
            ],
        })(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemStatus.load({status: false, delay: 0}, [730]);
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['get', 'https://cs.money/list_unavailable?appId=730'],
        ['statuses', {
            730: {
                name1: 'Unavailable',
                name2: -1,
            },
            570: {},
        }],
    ]);
});

Test('Успешная загрузка статусов с дефолтными параметрами ', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({
            overstocks: [
                {
                    market_hash_name: 'name1',
                    overstock_difference: -1,
                },
                {
                    market_hash_name: 'name2',
                    overstock_difference: -1,
                },
            ],
            unavailable: [
                {
                    market_hash_name: 'name1',
                },
            ],
        })(dispatches),
        console: console(dispatches),
        defaultSetting: {
            repeatLoad: {
                checkStatus: {
                    status: false,
                    delay: 0,
                },
            },
            appIdList: [730],
        },
    });
    
    await injectedItemStatus.load();
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['get', 'https://cs.money/list_unavailable?appId=730'],
        ['statuses', {
            730: {
                name1: 'Unavailable',
                name2: -1,
            },
            570: {},
        }],
    ]);
});

Test('Успешная загрузка статусов с повторной загрузкой', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({
            overstocks: [
                {
                    market_hash_name: 'name1',
                    overstock_difference: -1,
                },
                {
                    market_hash_name: 'name2',
                    overstock_difference: -1,
                },
            ],
            unavailable: [
                {
                    market_hash_name: 'name1',
                },
            ],
        })(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemStatus.load({status: true, delay: 60000}, [730]);
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['get', 'https://cs.money/list_unavailable?appId=730'],
        ['setTimeout', '() => this.load(repeatLoad, appIdList)', 60000],
        ['statuses', {
            730: {
                name1: 'Unavailable',
                name2: -1,
            },
            570: {},
        }],
    ]);
});

Test('Успешная загрузка статусов без оверстоков', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({
            unavailable: [
                {
                    market_hash_name: 'name1',
                },
            ],
        })(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemStatus.load({status: false, delay: 0}, [730]);
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['get', 'https://cs.money/list_unavailable?appId=730'],
        ['statuses', {
            730: {},
            570: {},
        }],
    ]);
});

Test('Успешная загрузка статусов, где оверсток != array', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({
            overstocks: 'data',
            unavailable: [
                {
                    market_hash_name: 'name1',
                },
            ],
        })(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemStatus.load({status: false, delay: 0}, [730]);
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['get', 'https://cs.money/list_unavailable?appId=730'],
        ['statuses', {
            730: {},
            570: {},
        }],
    ]);
});

Test('Успешная загрузка статусов без unavailable', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({
            overstocks: [
                {
                    market_hash_name: 'name1',
                    overstock_difference: -1,
                },
                {
                    market_hash_name: 'name2',
                    overstock_difference: -1,
                },
            ],
        })(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemStatus.load({status: false, delay: 0}, [730]);
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['get', 'https://cs.money/list_unavailable?appId=730'],
        ['statuses', {
            730: {},
            570: {},
        }],
    ]);
});

Test('Успешная загрузка статусов, где unavailable != array', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getSuccess({
            overstocks: [
                {
                    market_hash_name: 'name1',
                    overstock_difference: -1,
                },
                {
                    market_hash_name: 'name2',
                    overstock_difference: -1,
                },
            ],
            unavailable: 'data',
        })(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemStatus.load({status: false, delay: 0}, [730]);
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['get', 'https://cs.money/list_unavailable?appId=730'],
        ['statuses', {
            730: {},
            570: {},
        }],
    ]);
});

Test('Неуспешная загрузка статусов', async t => {
    const dispatches = [];
    
    const injectedItemStatus = itemStatus({
        setTimeout: setTimeout(dispatches),
        get: getError(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedItemStatus.load({status: false, delay: 0}, [730]);
    
    dispatches.push(['statuses', injectedItemStatus.status]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://cs.money/list_overstock?appId=730'],
        ['console.log', 'Ошибка при обновлении статусов предметов CS:GO, DOTA2', 'error'],
        ['statuses', {
            730: {},
            570: {},
        }],
    ]);
});
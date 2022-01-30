/* eslint-disable id-length*/
import Test from 'ava';
import {myInventory} from '../myInventory.js';

const console = dispatches => ({
    log: (...values) => dispatches.push(['console.log', ...values]),
});
const setTimeout = dispatches => (callback, timeout) => dispatches.push(['setTimeout', callback.toString(), timeout]);
const unstackItems = dispatches => (item, appId) => {
    dispatches.push(['unstackItems', item, appId]);
    return [{...item, appId}];
};

const getSuccess = response => dispatches => (...values) => {
    dispatches.push(['get', ...values]);
    return Promise.resolve(response);
};

const getError = dispatches => (...values) => {
    dispatches.push(['get', ...values]);
    return Promise.reject('error');
};

Test('Должно присутствовать поле accounts', t => {
    t.assert(myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    }).accounts);
});

Test('Добавление предмета работает верно', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {730: {itemsCsm: {}}};
    injectedMyInventory.add('key', {
        appId: 730,
        o: 1,
    }, 730);
    t.deepEqual(injectedMyInventory.accounts.key, {
        730: {
            itemsCsm: {
                1: [{
                    appId: 730,
                    o: 1,
                }],
            },
        },
    });
});

Test('Добавление предмета работает верно при отсутствии у предмета appId', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {730: {itemsCsm: {}}};
    injectedMyInventory.add('key', {
        o: 1,
    }, 730);
    t.deepEqual(injectedMyInventory.accounts.key, {
        730: {
            itemsCsm: {
                1: [{
                    o: 1,
                }],
            },
        },
    });
});

Test('Удаление предмета работает верно', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    appId: 730,
                    o: 1,
                }],
            },
        },
    };
    
    injectedMyInventory.remove('key', {
        id: [1],
        appId: 730,
        o: 1,
    }, 730);
    t.deepEqual(injectedMyInventory.accounts.key, {
        730: {
            itemsCsm: {},
        },
    });
});

Test('Удаление предмета работает верно при отсутствии у предмета appId', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    o: 1,
                }],
            },
        },
    };
    
    injectedMyInventory.remove('key', {
        id: [1],
        o: 1,
    }, 730);
    t.deepEqual(injectedMyInventory.accounts.key, {
        730: {
            itemsCsm: {},
        },
    });
});

Test('Получение инвентаря работает верно с accountId и appId', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    appId: 730,
                    o: 1,
                }],
            },
        },
    };
    
    t.deepEqual(injectedMyInventory.get('key', 730), {
        itemsCsm: {
            1: [{
                id: [1],
                appId: 730,
                o: 1,
            }],
        },
    });
});

Test('Получение инвентаря работает верно с accountId', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    appId: 730,
                    o: 1,
                }],
            },
        },
    };
    
    t.deepEqual(injectedMyInventory.get('key'), {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    appId: 730,
                    o: 1,
                }],
            },
        },
    });
});

Test('Получение инвентаря работает верно без параметров', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    appId: 730,
                    o: 1,
                }],
            },
        },
    };
    
    t.deepEqual(injectedMyInventory.get(), {
        key: {
            730: {
                itemsCsm: {
                    1: [{
                        id: [1],
                        appId: 730,
                        o: 1,
                    }],
                },
            },
        },
    });
});

Test('Получение всех инвентарей работает верно', t => {
    const injectedMyInventory = myInventory({
        setTimeout,
        unstackItems,
        get: getSuccess,
        console,
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    appId: 730,
                    o: 1,
                }],
            },
            error: 3,
        },
    };
    
    t.deepEqual(injectedMyInventory.getAll(), {
        730: {
            itemsCsm: {
                1: [{
                    id: [1],
                    appId: 730,
                    o: 1,
                }],
            },
            itemsSteam: {},
        },
    });
});

Test('Успешная загрузка инвентаря', async t => {
    const dispatches = [];
    
    const injectedMyInventory = myInventory({
        setTimeout: setTimeout(dispatches),
        unstackItems: unstackItems(dispatches),
        get: getSuccess([{o: 1, vi: [1]}, {o: 1, vi: [0]}])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {};
    
    await injectedMyInventory.load({key: 'cookie'}, {status: false, delay: 0}, [730], ['key']);
    
    dispatches.push(['inventory', injectedMyInventory.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_user_inventory', null, 'cookie'],
        ['unstackItems', {o: 1, vi: [1]}, 730],
        ['unstackItems', {o: 1, vi: [0]}, 730],
        ['inventory', {
            730: {
                itemsCsm: {
                    1: [{
                        appId: 730,
                        o: 1,
                        vi: [1],
                    }],
                },
                itemsSteam: {
                    1: [{
                        appId: 730,
                        o: 1,
                        vi: [0],
                    }],
                },
                error: false,
            },
        }],
    ]);
});

Test('Успешная загрузка инвентаря с дефолтными параметрами', async t => {
    const dispatches = [];
    
    const injectedMyInventory = myInventory({
        setTimeout: setTimeout(dispatches),
        unstackItems: unstackItems(dispatches),
        get: getSuccess([{o: 1, vi: [1]}, {o: 1, vi: [0]}])(dispatches),
        console: console(dispatches),
        defaultSetting: {
            repeatLoad: {
                myInventory: {
                    status: false,
                    delay: 0,
                },
            },
            appIdList: [730],
            accountIds: ['key'],
        },
    });
    injectedMyInventory.accounts.key = {};
    
    await injectedMyInventory.load({key: 'cookie'});
    
    dispatches.push(['inventory', injectedMyInventory.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_user_inventory', null, 'cookie'],
        ['unstackItems', {o: 1, vi: [1]}, 730],
        ['unstackItems', {o: 1, vi: [0]}, 730],
        ['inventory', {
            730: {
                itemsCsm: {
                    1: [{
                        appId: 730,
                        o: 1,
                        vi: [1],
                    }],
                },
                itemsSteam: {
                    1: [{
                        appId: 730,
                        o: 1,
                        vi: [0],
                    }],
                },
                error: false,
            },
        }],
    ]);
});

Test('Успешная загрузка инвентаря с повторной загрузкой', async t => {
    const dispatches = [];
    
    const injectedMyInventory = myInventory({
        setTimeout: setTimeout(dispatches),
        unstackItems: unstackItems(dispatches),
        get: getSuccess([{o: 1, vi: [1]}, {o: 1, vi: [0]}])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {};
    
    await injectedMyInventory.load({key: 'cookie'}, {status: true, delay: 60000}, [730], ['key']);
    
    const loadParams = injectedMyInventory.load.toString()
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',').map(param => param.split('=')[0].trim());
    const recursiveLoadParams = dispatches.find(dispatch => dispatch[0] === 'setTimeout')[1]
        .split(/\s/)
        .join('')
        .match(/(?<=load\s*\().+?(?=\))/)[0].split(',')
        .map(param => param.split('=')[0].trim());
    
    t.deepEqual(loadParams, recursiveLoadParams);
    
    dispatches.push(['inventory', injectedMyInventory.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_user_inventory', null, 'cookie'],
        ['unstackItems', {o: 1, vi: [1]}, 730],
        ['unstackItems', {o: 1, vi: [0]}, 730],
        ['setTimeout', '() => this.load(cookie, repeatLoad, appIdList, requiredAccounts)', 60000],
        ['inventory', {
            730: {
                itemsCsm: {
                    1: [{
                        appId: 730,
                        o: 1,
                        vi: [1],
                    }],
                },
                itemsSteam: {
                    1: [{
                        appId: 730,
                        o: 1,
                        vi: [0],
                    }],
                },
                error: false,
            },
        }],
    ]);
});

Test('Успешная загрузка пустого инвентаря', async t => {
    const dispatches = [];
    
    const injectedMyInventory = myInventory({
        setTimeout: setTimeout(dispatches),
        unstackItems: unstackItems(dispatches),
        get: getSuccess([])(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {};
    
    await injectedMyInventory.load({key: 'cookie'}, {status: false, delay: 0}, [730], ['key']);
    
    dispatches.push(['inventory', injectedMyInventory.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_user_inventory', null, 'cookie'],
        ['inventory', {
            730: {
                itemsCsm: {},
                itemsSteam: {},
                error: false,
            },
        }],
    ]);
});

Test('Успешная загрузка инвентаря с ошибкой', async t => {
    const dispatches = [];
    
    const injectedMyInventory = myInventory({
        setTimeout: setTimeout(dispatches),
        unstackItems: unstackItems(dispatches),
        get: getSuccess({error: 3})(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    injectedMyInventory.accounts.key = {};
    
    await injectedMyInventory.load({key: 'cookie'}, {status: false, delay: 0}, [730], ['key']);
    
    dispatches.push(['inventory', injectedMyInventory.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_user_inventory', null, 'cookie'],
        ['console.log', 3],
        ['inventory', {
            730: {
                itemsCsm: {},
                itemsSteam: {},
                error: 3,
            },
        }],
    ]);
});

Test('Неуспешная загрузка инвентаря', async t => {
    const dispatches = [];
    
    const injectedMyInventory = myInventory({
        setTimeout: setTimeout(dispatches),
        unstackItems: unstackItems(dispatches),
        get: getError(dispatches),
        console: console(dispatches),
        defaultSetting: {},
    });
    
    await injectedMyInventory.load({key: 'cookie'}, {status: false, delay: 0}, [730], ['key']);
    
    dispatches.push(['inventory', injectedMyInventory.accounts.key]);
    
    t.deepEqual(dispatches, [
        ['get', 'https://old.cs.money/730/load_user_inventory', null, 'cookie'],
        ['console.log', 'Ошибка при обновлении инвентаря', 'error'],
        ['inventory', {}],
    ]);
});
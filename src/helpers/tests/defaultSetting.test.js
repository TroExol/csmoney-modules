/* eslint-disable id-length*/
import Test from 'ava';
import defaultSetting from '../defaultSetting.js';

Test('Должна присутствовать дефолтная настройка steamAuthorizationData', t => {
    t.assert(defaultSetting.steamAuthorizationData);
});

Test('Должна присутствовать дефолтная настройка receiveCookie', t => {
    t.assert(defaultSetting.receiveCookie);
    t.assert(defaultSetting.receiveCookie.oldCsm);
    t.assert(defaultSetting.receiveCookie.newCsm);
});

Test('Должна присутствовать дефолтная настройка isBuyOn', t => {
    t.assert(defaultSetting.isBuyOn);
});

Test('Должна присутствовать дефолтная настройка isBuyOnWhileRefreshBots', t => {
    t.assert(defaultSetting.isBuyOnWhileRefreshBots);
});

Test('Должна присутствовать дефолтная настройка blacklist', t => {
    t.assert(defaultSetting.blacklist);
});

Test('Должна присутствовать дефолтная настройка commission', t => {
    t.assert(defaultSetting.commission);
});

Test('Должна присутствовать дефолтная настройка profit', t => {
    t.assert(defaultSetting.profit);
    t.assert(defaultSetting.profit.notOverstock === 10);
    t.assert(defaultSetting.profit.overstock === 16);
});

Test('Должна присутствовать дефолтная настройка delayReconnectWS', t => {
    t.assert(defaultSetting.delayReconnectWS);
});

Test('Должна присутствовать дефолтная настройка maxCountParallelsBuying', t => {
    t.assert(defaultSetting.maxCountParallelsBuying);
});

Test('Должна присутствовать дефолтная настройка buyRecursivelyDuration', t => {
    t.assert(defaultSetting.buyRecursivelyDuration);
});

Test('Должна присутствовать дефолтная настройка buyRecursivelyFrequency', t => {
    t.assert(defaultSetting.buyRecursivelyFrequency);
});

Test('Должна присутствовать дефолтная настройка badQueriesTime', t => {
    t.assert(defaultSetting.badQueriesTime);
});

Test('Должна присутствовать дефолтная настройка maxBadQueriesByTime', t => {
    t.assert(defaultSetting.maxBadQueriesByTime);
});

Test('Должна присутствовать дефолтная настройка appIdList', t => {
    t.assert(defaultSetting.appIdList);
});

Test('Должна присутствовать дефолтная настройка languageName', t => {
    t.assert(defaultSetting.languageName);
});

Test('Должна присутствовать дефолтная настройка limitOverstock', t => {
    t.assert(defaultSetting.limitOverstock);
});

Test('Должна присутствовать дефолтная настройка repeatLoad', t => {
    t.assert(defaultSetting.repeatLoad);
});

Test('Должна присутствовать дефолтная настройка repeatLoad.myInventory', t => {
    t.assert(defaultSetting.repeatLoad.myInventory);
    t.assert(defaultSetting.repeatLoad.myInventory.status === false);
    t.assert(defaultSetting.repeatLoad.myInventory.delay === 0);
});

Test('Должна присутствовать дефолтная настройка repeatLoad.itemNames', t => {
    t.assert(defaultSetting.repeatLoad.itemNames);
    t.assert(defaultSetting.repeatLoad.itemNames.status === false);
    t.assert(defaultSetting.repeatLoad.itemNames.delay === 0);
});

Test('Должна присутствовать дефолтная настройка repeatLoad.checkStatus', t => {
    t.assert(defaultSetting.repeatLoad.checkStatus);
    t.assert(defaultSetting.repeatLoad.checkStatus.status === false);
    t.assert(defaultSetting.repeatLoad.checkStatus.delay === 0);
});

Test('Должна присутствовать дефолтная настройка repeatLoad.balance', t => {
    t.assert(defaultSetting.repeatLoad.balance);
    t.assert(defaultSetting.repeatLoad.balance.status === false);
    t.assert(defaultSetting.repeatLoad.balance.delay === 0);
});

Test('Должна присутствовать дефолтная настройка repeatLoad.transactions', t => {
    t.assert(defaultSetting.repeatLoad.transactions);
    t.assert(defaultSetting.repeatLoad.transactions.status === false);
    t.assert(defaultSetting.repeatLoad.transactions.delay === 0);
});

Test('Должна присутствовать дефолтная настройка repeatLoad.purchases', t => {
    t.assert(defaultSetting.repeatLoad.purchases);
    t.assert(defaultSetting.repeatLoad.purchases.status === false);
    t.assert(defaultSetting.repeatLoad.purchases.delay === 0);
});

Test('Установка настроек работает верно', t => {
    const dispatches = [];
    
    const defaultSettingThis = new Proxy(defaultSetting, {
        get (target, key) {
            if (typeof target[key] === 'object' && target[key] !== null) {
                return new Proxy(target[key], this);
            } else {
                return target[key];
            }
        },
        set: (target, prop, value) => {
            if (target[prop] !== value) {
                target[prop] = value;
                dispatches.push(['setAttribute', prop, value]);
            }
            
            return true;
        },
    });
    
    defaultSettingThis.set({
        languageName: 'ru',
        setting: 'setting',
    });
    
    t.deepEqual(dispatches, [
        ['setAttribute', 'languageName', 'ru'],
        ['setAttribute', 'setting', 'setting'],
    ]);
});

Test('Установка настроек с вложенными объектами работает верно', t => {
    const dispatches = [];
    
    const defaultSettingThis = new Proxy(defaultSetting, {
        get (target, key) {
            if (typeof target[key] === 'object' && target[key] !== null) {
                return new Proxy(target[key], this);
            } else {
                return target[key];
            }
        },
        set: (target, prop, value) => {
            target[prop] = value;
            dispatches.push(['setAttribute', prop, value]);
            
            return true;
        },
    });
    
    defaultSettingThis.set({
        repeatLoad: {
            myInventory: {
                status: true,
                delay: 60000,
            },
        },
        settingObj: {
            innerSetting: {
                data: 'data',
            },
        },
    });
    
    t.deepEqual(dispatches, [
        ['setAttribute', 'myInventory', {
            status: true,
            delay: 60000,
        }],
        ['setAttribute', 'settingObj', {
            innerSetting: {
                data: 'data',
            },
        }],
        ['setAttribute', 'innerSetting', {
            data: 'data',
        }],
    ]);
});

Test('При установке repeatLoad без status происходит ошибка', t => {
    t.throws(() => defaultSetting.set({
        repeatLoad: {
            myInventory: {
                delay: 60000,
            },
        },
    }), {message: 'Для настройки repeatLoad необходимо установить поля status и delay'});
});

Test('При установке repeatLoad без delay происходит ошибка', t => {
    t.throws(() => defaultSetting.set({
        repeatLoad: {
            myInventory: {
                status: true,
            },
        },
    }), {message: 'Для настройки repeatLoad необходимо установить поля status и delay'});
});

Test('При установке repeatLoad без status и delay происходит ошибка', t => {
    t.throws(() => defaultSetting.set({
        repeatLoad: {
            myInventory: {},
        },
    }), {message: 'Для настройки repeatLoad необходимо установить поля status и delay'});
});

Test('Получение ключей аккаунтов работает верно', t => {
    defaultSetting.steamAuthorizationData = {};
    defaultSetting.set({
        steamAuthorizationData: {
            key: {},
        },
    });
    
    t.deepEqual(defaultSetting.getAccountIds(), ['key']);
});

Test('Получение ключей аккаунтов при отсутствии аккаунтов работает верно', t => {
    defaultSetting.steamAuthorizationData = {};
    t.deepEqual(defaultSetting.getAccountIds(), []);
});

Test('Получение данных аккаунтов работает верно', t => {
    defaultSetting.steamAuthorizationData = {};
    defaultSetting.set({
        steamAuthorizationData: {
            key: {id: 1},
        },
    });
    
    t.deepEqual(defaultSetting.getAccountDetails(), [{id: 1}]);
});

Test('Получение данных аккаунта работает верно', t => {
    defaultSetting.steamAuthorizationData = {};
    defaultSetting.set({
        steamAuthorizationData: {
            key: {id: 1},
        },
    });
    
    t.deepEqual(defaultSetting.getAccountDetails('key'), {id: 1});
});

Test('Получение данных несуществующего аккаунта работает верно', t => {
    defaultSetting.steamAuthorizationData = {};
    t.deepEqual(defaultSetting.getAccountDetails('key2'), undefined);
});
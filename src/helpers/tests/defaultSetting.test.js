/* eslint-disable id-length*/
import Test from 'ava';
import defaultSetting from '../defaultSetting.js';

Test('Должна присутствовать дефолтная настройка keyAccounts', t => {
    t.assert(defaultSetting.keyAccounts);
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
        keyAccounts: ['1', '2'],
        languageName: 'ru',
        setting: 'setting',
    });
    
    t.deepEqual(dispatches, [
        ['setAttribute', 'keyAccounts', ['1', '2']],
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
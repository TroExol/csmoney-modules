import {isObject} from './index.js';

const defaultSetting = {
    /**
     * @type {{oldCsm: Boolean, newCsm: Boolean}} - Включено ли получение куки.
     */
    receiveCookie: {
        oldCsm: true,
        newCsm: true,
    },
    /**
     * @type {Object<String, Object>} - Данные об аккаунтах.
     */
    steamAuthorizationData: {},
    /**
     * @type {Object<String, Boolean>} - Включена ли покупка для аккаунтов.
     */
    isBuyOn: {},
    /**
     * @type {Object<String, Boolean>} - Включена ли покупка для аккаунтов при перезагрузке ботов.
     */
    isBuyOnWhileRefreshBots: {},
    /**
     * @type {Object<String, Boolean>} - Включена ли продажа для аккаунтов.
     */
    isSellOn: {},
    /**
     * @type {String[]} - Предметы, которые не покупать.
     */
    blacklist: [],
    /**
     * @type {array} - Массив с id нужных игр.
     */
    appIdList: [570, 730],
    /**
     * @type {'ru' | 'en'} - Выбор языка для предметов.
     */
    languageName: 'en',
    /**
     * @type {Object<String, Number>} - Допустимый предел оверстока.
     */
    limitOverstock: {},
    /**
     * @type {Object<String, Number>} - Комиссия аккаунтов на продажу.
     */
    commission: {},
    /**
     * @type {Object<String, Number>} - Минимальный профит при покупке не в оверстоке.
     */
    profitNotOverstock: {},
    /**
     * @type {Object<String, Number>} - Минимальный профит при покупке в оверстоке.
     */
    profitOverstock: {},
    /**
     * @type {Number} - Задержка перед подключением к WS (в миллисекундах).
     */
    delayReconnectWS: 30000,
    /**
     * @type {Object<String, Number>} - Максимальное количество параллельных покупок для аккаунта.
     */
    maxCountParallelsBuying: {},
    /**
     * @type {Object<String, Number>} - Максимальное количество параллельных продаж для аккаунта.
     */
    maxCountParallelsSelling: {},
    /**
     * @type {Number} - Длительность рекурсивной покупки (в миллисекундах).
     */
    buyRecursivelyDuration: 35000,
    /**
     * @type {Number} - Периодичность отправки запросов рекурсивной покупки (в миллисекундах).
     */
    buyRecursivelyFrequency: 4000,
    /**
     * @type {Number} - Длительность рекурсивной продажи (в миллисекундах).
     */
    sellRecursivelyDuration: 50000,
    /**
     * @type {Number} - Периодичность отправки запросов рекурсивной продажи (в миллисекундах).
     */
    sellRecursivelyFrequency: 10000,
    /**
     * @type {Number} - За какое время считать количество неудачных запросов (в миллисекундах).
     */
    badQueriesTime: 15 * 60000,
    /**
     * @type {Number} - Максимальное количество неудачных запросов за определенное время.
     */
    maxBadQueriesByTime: 27,
    /**
     * @type {object} - Объект с настройками обновлений данных.
     */
    repeatLoad: {
        myInventory: {
            status: true,
            delay: 50000,
        },
        itemNames: {
            status: true,
            delay: 30 * 60000,
        },
        checkStatus: {
            status: true,
            delay: 60000,
        },
        balance: {
            status: true,
            delay: 60000,
        },
        transactions: {
            status: false,
            delay: 0,
        },
        purchases: {
            status: true,
            delay: 50000,
        },
        confirmOffer: {
            status: true,
            delay: 60000,
        },
        checkForSell: {
            status: true,
            delay: 1.5 * 60000,
        },
        checkForBuy: {
            status: true,
            delay: 1.5 * 60000,
        }
    },
    /** Установка значений по умолчанию.
     * @param { object? } settings - Настройки
     * @param { Array? } settings.appIdList - Массив с id нужных игр.
     * @param { String? } settings.languageName - Выбор языка для предметов. (ru || en)
     *
     * @param { object? } settings.repeatLoad - Настройки обновления данных.
     *
     * @param { object? } settings.repeatLoad.myInventory - Настройки обновления инвентаря пользователя.
     * @param { Boolean } settings.repeatLoad.myInventory.status - Включить / Выключить повторное обновление.
     * @param { Number } settings.repeatLoad.myInventory.delay - Выбор языка для предметов. (ru || en)
     *
     * @param { object? } settings.repeatLoad.itemNames - Настройки обновления name id.
     * @param { Boolean } settings.repeatLoad.itemNames.status - Включить / Выключить повторное обновление.
     * @param { Number } settings.repeatLoad.itemNames.delay - Время задержки перед повторным обновлением.
     *
     * @param { object? } settings.repeatLoad.checkStatus - Настройки обновления статусов предметов.
     * @param { Boolean } settings.repeatLoad.checkStatus.status - Включить / Выключить повторное обновление.
     * @param { Number } settings.repeatLoad.checkStatus.delay - Время задержки перед повторным обновлением.
     *
     * @param { object? } settings.repeatLoad.balance - Настройки обновления баланса.
     * @param { Boolean } settings.repeatLoad.balance.status - Включить / Выключить повторное обновление.
     * @param { Number } settings.repeatLoad.balance.delay - Время задержки перед повторным обновлением.
     */
    set (settings) {
        // Изменяем нужные настройки
        Object.entries(settings).forEach(([settingKey, settingData]) => {
            // Если в настройке нет вложенных объектов
            if (!isObject(settingData)) {
                this[settingKey] = settingData;
            } else {
                // Изменяем внутри нужных настроек
                Object.entries(settingData).forEach(([entrySettingKey, entrySettingData]) => {
                    if (settingKey === 'repeatLoad'
                        && ([null, undefined].includes(entrySettingData.status)
                            || [null, undefined].includes(entrySettingData.delay))) {
                        throw new Error('Для настройки repeatLoad необходимо установить поля status и delay');
                    }
                    if (!this[settingKey]) {
                        this[settingKey] = {};
                    }
                    this[settingKey][entrySettingKey] = entrySettingData;
                });
            }
        });
    },
    /**
     * Получение ключей аккаунтов.
     * @returns {String[]}
     */
    getAccountIds () {
        return Object.keys(this.steamAuthorizationData);
    },
    /**
     * Получение данных об аккаунте.
     * @param {String} [accountId] - Ключ аккаунта.
     * @returns {Object | Object[]}
     */
    getAccountDetails (accountId) {
        return accountId
            ? this.steamAuthorizationData[accountId]
            : Object.values(this.steamAuthorizationData);
    },
};

export default defaultSetting;
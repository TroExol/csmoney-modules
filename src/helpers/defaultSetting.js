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
     * @type {String[]} - Предметы, которые не покупать.
     */
    blacklist: [],
    /**
     * @type {array} - Массив с id нужных игр.
     */
    appIdList: [570, 730],
    /**
     * @type {String} - Выбор языка для предметов. (ru || en)
     */
    languageName: 'en',
    /**
     * @type {Number} - Допустимый предел оверстока.
     */
    limitOverstock: -6,
    /**
     * @type {Object<String, Number>} - Комиссия аккаунтов на продажу.
     */
    commission: {},
    /**
     * @type {{notOverstock: Number, overstock: Number}} - Минимальный профит при покупке.
     */
    profit: {
        notOverstock: 10,
        overstock: 16,
    },
    /**
     * @type {Number} - Задержка перед подключением к WS (в миллисекундах).
     */
    delayReconnectWS: 60000,
    /**
     * @type {Number} - Максимальное количество параллельных покупок для аккаунта.
     */
    maxCountParallelsBuying: 1,
    /**
     * @type {Number} - Максимальное количество параллельных продаж для аккаунта.
     */
    maxCountParallelsSelling: 2,
    /**
     * @type {Number} - Длительность рекурсивной покупки (в миллисекундах).
     */
    buyRecursivelyDuration: 30000,
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
            status: false,
            delay: 0,
        },
        itemNames: {
            status: false,
            delay: 0,
        },
        checkStatus: {
            status: false,
            delay: 0,
        },
        balance: {
            status: false,
            delay: 0,
        },
        transactions: {
            status: false,
            delay: 0,
        },
        purchases: {
            status: false,
            delay: 0,
        },
        confirmOffer: {
            status: false,
            delay: 0,
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
                    if (settingKey === 'repeatLoad' && (!entrySettingData.status || !entrySettingData.delay)) {
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
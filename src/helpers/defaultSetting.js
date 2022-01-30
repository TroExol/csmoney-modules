import {isObject} from './index.js';

const defaultSetting = {
    /**
     * @type {{oldCsm: boolean, newCsm: boolean}} - Включено ли получение куки.
     */
    receiveCookie: {
        oldCsm: true,
        newCsm: true,
    },
    /**
     * @type {Object<string, Object>} - Данные об аккаунтах.
     */
    steamAuthorizationData: {},
    /**
     * @type {Object<string, boolean>} - Включена ли покупка для аккаунтов.
     */
    isBuyOn: {},
    /**
     * @type {Object<string, boolean>} - Включена ли покупка для аккаунтов при перезагрузке ботов.
     */
    isBuyOnWhileRefreshBots: {},
    /**
     * @type {string[]} - Предметы, которые не покупать.
     */
    blacklist: [],
    /**
     * @type {array} - Массив с id нужных игр.
     */
    appIdList: [570, 730],
    /**
     * @type {string} - Выбор языка для предметов. (ru || en)
     */
    languageName: 'en',
    /**
     * @type {number} - Допустимый предел оверстока.
     */
    limitOverstock: -6,
    /**
     * @type {Object<string, number>} - Комиссия аккаунтов на продажу.
     */
    commission: {},
    /**
     * @type {{notOverstock: number, overstock: number}} - Минимальный профит при покупке.
     */
    profit: {
        notOverstock: 10,
        overstock: 16,
    },
    /**
     * @type {number} - Задержка перед подключением к WS (в миллисекундах).
     */
    delayReconnectWS: 60000,
    /**
     * @type {number} - Максимальное количество параллельных покупок.
     */
    maxCountParallelsBuying: 1,
    /**
     * @type {number} - Длительность рекурсивной покупки (в миллисекундах).
     */
    buyRecursivelyDuration: 30000,
    /**
     * @type {number} - Периодичность отправки запросов рекурсивной покупки (в миллисекундах).
     */
    buyRecursivelyFrequency: 4000,
    /**
     * @type {number} - За какое время считать количество неудачных запросов (в миллисекундах).
     */
    badQueriesTime: 15 * 60000,
    /**
     * @type {number} - Максимальное количество неудачных запросов за определенное время.
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
    },
    /** Установка значений по умолчанию.
    * @param { object? } settings - Настройки
    * @param { Array? } settings.appIdList - Массив с id нужных игр.
    * @param { string? } settings.languageName - Выбор языка для предметов. (ru || en)
    *
    * @param { object? } settings.repeatLoad - Настройки обновления данных.
    *
    * @param { object? } settings.repeatLoad.myInventory - Настройки обновления инвентаря пользователя.
    * @param { boolean } settings.repeatLoad.myInventory.status - Включить / Выключить повторное обновление.
    * @param { number } settings.repeatLoad.myInventory.delay - Выбор языка для предметов. (ru || en)
    *
    * @param { object? } settings.repeatLoad.itemNames - Настройки обновления name id.
    * @param { boolean } settings.repeatLoad.itemNames.status - Включить / Выключить повторное обновление.
    * @param { number } settings.repeatLoad.itemNames.delay - Время задержки перед повторным обновлением.
    *
    * @param { object? } settings.repeatLoad.checkStatus - Настройки обновления статусов предметов.
    * @param { boolean } settings.repeatLoad.checkStatus.status - Включить / Выключить повторное обновление.
    * @param { number } settings.repeatLoad.checkStatus.delay - Время задержки перед повторным обновлением.
    *
    * @param { object? } settings.repeatLoad.balance - Настройки обновления баланса.
    * @param { boolean } settings.repeatLoad.balance.status - Включить / Выключить повторное обновление.
    * @param { number } settings.repeatLoad.balance.delay - Время задержки перед повторным обновлением.
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
     * @returns {string[]}
     */
    getAccountIds () {
        return Object.keys(this.steamAuthorizationData);
    },
    /**
     * Получение данных об аккаунте.
     * @param {string} [accountId] - Ключ аккаунта.
     * @returns {Object | Object[]}
     */
    getAccountDetails (accountId) {
        return accountId
            ? this.steamAuthorizationData[accountId]
            : Object.values(this.steamAuthorizationData);
    },
};

export default defaultSetting;
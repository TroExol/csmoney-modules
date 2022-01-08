import {isObject} from './index.js';

const defaultSetting = {
    /**
     * @type {array} - Имена для всех аккаунтов, для которых нужен доступ к CSM.
     */
    keyAccounts: ['account'],
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
    },
    /**
     * Установка значений по умолчанию.
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
};

export default defaultSetting;
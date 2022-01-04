import {isObject} from './index.js';

const defaultSetting = {
    /**
     * @type {array} - Имена для всех аккаутов, для которых нужен достум к CSM. 
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
            delay: 0
        },
        itemNames: {
            status: false,
            delay: 0
        },
        checkStatus: {
            status: false,
            delay: 0
        },
        balance: {
            status: false,
            delay: 0
        },
    },
    /**
     * Установка значений по уолчанию.
     * @param { object } setting 
     * @param { Array } setting.appIdList - Массив с id нужных игр. 
     * @param { string } setting.languageName - Выбор языка для предметов. (ru || en)
     * 
     * @param { object } setting.repeatLoad - Выбор языка для предметов. (ru || en)
     * 
     * @param { object } setting.repeatLoad.myInventory - Настройки обновления инвентаря пользователя.
     * @param { boolean } setting.repeatLoad.myInventory.status - Включить / Выключить повтороное обновление.
     * @param { number } setting.repeatLoad.myInventory.delay - Выбор языка для предметов. (ru || en)
     * 
     * @param { object } setting.repeatLoad.itemNames - Настройки обновления name id.
     * @param { boolean } setting.repeatLoad.itemNames.status - Включить / Выключить повтороное обновление.
     * @param { number } setting.repeatLoad.itemNames.delay - Время задержки перед повторным обновлением.
     * 
     * @param { object } setting.repeatLoad.checkStatus - Настройки обновления статусов предметов.
     * @param { boolean } setting.repeatLoad.checkStatus.status - Включить / Выключить повтороное обновление.
     * @param { number } setting.repeatLoad.checkStatus.delay - Время задержки перед повторным обновлением.
     * 
     * @param { object } setting.repeatLoad.balance - Настройки обновления баланса.
     * @param { boolean } setting.repeatLoad.balance.status - Включить / Выключить повтороное обновление.
     * @param { number } setting.repeatLoad.balance.delay - Время задержки перед повторным обновлением.
     */

    set(setting) {
        // Получаем список нужных настроек, которые нужно изменить
        const events = Object.keys(setting);

        // Цикл для применения настроек 
        for (let indexEvents = 0; indexEvents < events.length; indexEvents++) {
            const event = events[indexEvents];
            if (!isObject(setting[event])) {
                this[event] = setting[event];
            } else {
                const eventElements = Object.keys(setting[event]);
                // Цикл на случай, если настройка является объектом 
                for (let indexEventElements = 0; indexEventElements < eventElements.length; indexEventElements++) {
                    const element = eventElements[indexEventElements];
                    if (setting[event][element].status && setting[event][element].delay) {
                        this[event][element] = setting[event][element];
                    }
                }
            }
            
        }
    }
};

export default defaultSetting;
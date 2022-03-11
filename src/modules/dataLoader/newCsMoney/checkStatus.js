import {get} from '../../senders/index.js';
import {defaultSetting} from '../../../helpers/index.js';

export const itemStatus = ({
    setTimeout,
    console,
    get,
    defaultSetting,
}) => ({
    status: {
        730: {},
        570: {},
    },
    
    /** === 'Unavailable'
     * Проверка статуса предмета
     * @param {string} itemName - Имя предмета.
     * @param {number} appId - Id игры.
     * @param {number} limitOverstock - Допустимый предел оверстока.
     * @returns {boolean}
     */
    check (itemName, appId, limitOverstock = defaultSetting.limitOverstock) {
        return (!this.status[appId][itemName])
            ? true
            : this.status[appId][itemName] !== 'Unavailable' && this.status[appId][itemName] >= limitOverstock;
    },
    /**
     * Получение оверстоков.
     * @param {string | number} [appId] - id необходимой игры.
     * @returns {Object<string, Object<string, number | string>> | undefined}
     */
    get (appId) {
        return appId ? this.status[appId] : this.status;
    },
    /**
     * Обновление статусов с сервера.
     * @param {object} repeatLoad - Объект с информацией о повторном обновлении.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением списка.
     *
     * @param {Array} appIdList - Массив с id нужных игр.
     *
     * @returns {Promise<void>}
     */
    async load (repeatLoad = defaultSetting.repeatLoad.checkStatus, appIdList = defaultSetting.appIdList) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(repeatLoad, appIdList), repeatLoad.delay);
        
        try {
            for (const appId of appIdList) {
                // Получение overstock и unavailable
                const overstocks = await get(`https://cs.money/list_overstock?appId=${appId}`);
                const unavailable = await get(`https://cs.money/list_unavailable?appId=${appId}`);
                
                // Не удалось получить overstock и unavailable
                if ((!overstocks || !Array.isArray(overstocks)) || (!unavailable || !Array.isArray(unavailable))) {
                    continue;
                }
                
                for (const item of unavailable) {
                    this.status[appId][item.market_hash_name] = 'Unavailable';
                }
                
                for (const item of overstocks) {
                    if (!this.status[appId][item.market_hash_name]) {
                        this.status[appId][item.market_hash_name] = item.overstock_difference;
                    }
                }
                
            }
        } catch (error) {
            console.log('Ошибка при обновлении статусов предметов CS:GO, DOTA2', error);
        } finally {
            startReload();
        }
    },
});

export default itemStatus({
    setTimeout,
    console,
    get,
    defaultSetting,
});
import {get} from '../senders/index.js';
import {defaultSetting} from '../../helpers/index.js';

/**
 * Список названий предметов.
 */
const itemNamesLoader = {
    nameId: {
        730: undefined,
        570: undefined,
    },
    
    
    /**
     * Получение названий предметов.
     * @param {number | string} [appId] - Массив с id нужных игр. 
     * @returns {{nameId: {m: string}} || undefined}
     */
    get (appId) {
        return appId ? this.nameId[appId] : this.nameId;
    },
    
    /**
     * Обновление названий предметов с сервера.
     * 
     * @param {string} language - Выбор языка для предметов. (ru || en)
     * 
     * @param {object} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением списка.
     * 
     * @param {array} appidList - Массив с id нужных игр. 
     * 
     * @returns {Promise<void>}
     */
    async load (language = defaultSetting.languageName, repeatLoad = defaultSetting.repeatLoad.itemNames, appIdList = defaultSetting.appIdList) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(appIdList, language, repeatLoad), repeatLoad.delay);
        
        try {
            for (const appId of appIdList) {
                // Получение названий предмета
                const response = await get(`https://old.cs.money/js/database-skins/library-${language}-${appId}.js`);
                this.nameId[appId] = typeof response === 'string' ? JSON.parse(response.split(' = ')[1]) : {};
            }  
        } catch (error) {
            console.log('Ошибка при получении списка названий предметов CS:GO / DOTA2', error);
        } finally {
            startReload();
        }
    },
};

export default itemNamesLoader;
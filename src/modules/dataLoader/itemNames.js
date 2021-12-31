import {get} from '../senders/index.js';
import {isObject} from '../../helpers/index.js';

/**
 * Список названий предметов
 */
const itemNamesLoader = {
    730: undefined,
    570: undefined,
    
    /**
     * Изменение списка названий предметов
     * @param {{nameId: {m: string}}} itemNames - Список названий предметов
     */
    set (appid, itemNames) {
        this.appid = itemNames;
    },
    
    /**
     * Получение названий предметов
     * @returns {{nameId: {m: string}} || undefined}
     */
    get () {
        return this._itemNames;
    },
    
    /**
     * Обновление названий предметов с сервера
     * @param {array} appidList - Массив с id нужных игр. 
     * @param {string} language - Выбор языка для предметов. (ru || en)
     * @param {boolean} repeatLoad - Обновлять ли повторно
     * @param {number} reloadItemNamesTimeout - Таймаут перед обновлением списка
     * @returns {Promise<void>}
     */
    async load (appidList = [730, 570], language = 'en', repeatLoad = false, reloadItemNamesTimeout = 0) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad &&
            setTimeout(() => this.load(repeatLoad, reloadItemNamesTimeout), reloadItemNamesTimeout);
        
        try {
            for (let i = 0; i < appidList.length; i++) {
                const appid = appidList[i];
                // Получение названий предмета
                const response = await get(`https://old.cs.money/js/database-skins/library-${language}-${appid}.js`);
                const itemNames = JSON.parse(response.split(' = ')[1]);

                // Не удалось получить названия предметов
                if (!itemNames || !isObject(itemNames)) {
                    return;
                }
            
                this.set(appid, itemNames);
            }
            
        } catch (error) {
            console.log('Ошибка при получении списка названий предметов CS:GO', error);
        } finally {
            startReload();
        }
    },
};

export default itemNamesLoader;
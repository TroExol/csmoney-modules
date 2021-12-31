import {get} from '../senders';
import {isObject} from '../../helpers';

/**
 * Список названий предметов
 */
const itemNamesLoader = {
    _itemNames: undefined,
    
    /**
     * Изменение списка названий предметов
     * @param {{nameId: {m: string}}} itemNames - Список названий предметов
     */
    set (itemNames) {
        this._itemNames = itemNames;
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
     * @param {string} cookie - Куки
     * @param {Boolean} repeatLoad - Обновлять ли повторно
     * @param {number} reloadItemNamesTimeout - Таймаут перед обновлением списка
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad, reloadItemNamesTimeout) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad &&
            setTimeout(() => this.load(cookie, repeatLoad, reloadItemNamesTimeout), reloadItemNamesTimeout);
        
        try {
            // Получение названий предмета
            const response = await get(
                'https://old.cs.money/js/database-skins/library-ru-730.js',
                null,
                cookie,
            );
            const itemNames = JSON.parse(response.split(' = ')[1]);
            // Не удалось получить названия предметов
            if (!itemNames || !isObject(itemNames)) {
                return;
            }
            
            this.set(itemNames);
        } catch (error) {
            console.log('Ошибка при получении списка названий предметов CS:GO', error);
        } finally {
            startReload();
        }
    },
};

export default itemNamesLoader;
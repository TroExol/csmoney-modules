import {get} from '../senders';

/**
 * Список unavailable
 */
const unavailableLoader = {
    _unavailable: undefined,
    
    /**
     * Изменение списка unavailable
     * @param {{market_hash_name: true}} unavailable - Список unavailable
     */
    set (unavailable) {
        this._unavailable = unavailable;
    },
    
    /**
     * Получение unavailable
     * @returns {{market_hash_name: true} || undefined}
     */
    get () {
        return this._unavailable;
    },
    
    /**
     * Обновление unavailable с сервера
     * @param {string} cookie - Куки
     * @param {Boolean} repeatLoad - Обновлять ли повторно
     * @param {number} reloadUnavailableTimeout - Таймаут перед обновлением списка
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = false, reloadUnavailableTimeout = 0) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad &&
            setTimeout(() => this.load(cookie, repeatLoad, reloadUnavailableTimeout), reloadUnavailableTimeout);
        
        try {
            // Получение unavailable
            const unavailable = await get('https://cs.money/list_unavailable?appId=730', null, cookie);
            // Не удалось получить unavailable
            if (!unavailable || !Array.isArray(unavailable)) {
                return;
            }
            
            const unavailableObject = unavailable.reduce((obj, item) => {
                obj[item.market_hash_name] = true;
                return obj;
            }, {});
            
            this.set(unavailableObject);
        } catch (error) {
            console.log('Ошибка при получении списка unavailable CS:GO', error);
        } finally {
            startReload();
        }
    },
};

export default unavailableLoader;
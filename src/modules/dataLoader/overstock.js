import {get} from '../senders';

/**
 * Список оверстоков
 */
const overstocksLoader = {
    _overstocks: undefined,
    
    /**
     * Изменение списка оверстоков
     * @param {{market_hash_name: number}} overstocks - Список оверстоков
     */
    set (overstocks) {
        this._overstocks = overstocks;
    },
    
    /**
     * Получение оверстоков
     * @returns {{market_hash_name: number} || undefined}
     */
    get () {
        return this._overstocks;
    },
    
    /**
     * Обновление оверстоков с сервера
     * @param {string} cookie - Куки
     * @param {Boolean} repeatLoad - Обновлять ли повторно
     * @param {number} reloadOverstocksTimeout - Таймаут перед обновлением списка
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = false, reloadOverstocksTimeout = 0) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad &&
            setTimeout(() => this.load(cookie, repeatLoad, reloadOverstocksTimeout), reloadOverstocksTimeout);
        
        try {
            // Получение оверстоков
            const overstocks = await get('https://cs.money/list_overstock?appId=730', null, cookie);
            // Не удалось получить оверстоки
            if (!overstocks || !Array.isArray(overstocks)) {
                return;
            }
            
            const overstocksObject = overstocks.reduce((obj, item) => {
                obj[item.market_hash_name] = item.overstock_difference;
                return obj;
            }, {});
            
            this.set(overstocksObject);
        } catch (error) {
            console.log('Ошибка при обновлении списка оверстоков CS:GO', error);
        } finally {
            startReload();
        }
    },
};

export default overstocksLoader;
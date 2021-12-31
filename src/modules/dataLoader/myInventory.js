import {get} from '../senders';

/**
 * Мой инвентарь
 */
const myInventoryLoader = {
    /**
     * Предметы в инвентаре
     * @type {Object[] || undefined}
     */
    _items: undefined,
    
    /**
     * Ошибка при запросе инвентаря
     * @type {number || undefined}
     */
    _error: undefined,
    
    /**
     * Изменение инвентаря
     * @param {Object[]} items - Предметы
     */
    setItems (items) {
        this._items = items;
    },
    
    /**
     * Изменение ошибки
     * @param {number || undefined} error - Номер ошибки или ее отсутствие
     */
    setError (error) {
        this._error = error;
    },
    
    /**
     * Добавление предмета в мой инвентарь
     * @param {Object} item - Предмет
     */
    add (item) {
        this._items.push(item);
    },
    
    /**
     * Удаление предмета из моего инвентаря
     * @param {number} assetId - Id предмета
     */
    remove (assetId) {
        this.setItems(this._items.filter(item => item.assetId !== assetId));
    },
    
    /**
     * Получение инвентаря
     * @param {Boolean} showError - Показывать ли ошибки
     * @returns {Object[] || {error: number || undefined, items: Object[] || undefined} || undefined}
     */
    get (showError) {
        if (showError && this._error) {
            return {
                error: this._error,
                items: this._items,
            };
        }
        
        return this._items;
    },
    
    /**
     * Обновление инвентаря с сервера
     * @param {string} cookie - Куки
     * @param {Boolean} repeatLoad - Обновлять ли повторно
     * @param {number} reloadMyInventoryTimeout - Таймаут перед обновлением списка
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = false, reloadMyInventoryTimeout = 0) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad &&
            setTimeout(() => this.load(cookie, repeatLoad, reloadMyInventoryTimeout), reloadMyInventoryTimeout);
        
        try {
            // Получение предметов в личном инвентаре
            const items = await get(
                'https://cs.money/3.0/load_user_inventory/730',
                {
                    limit: 60,
                    noCache: true,
                    offset: 0,
                    order: 'desc',
                    sort: 'price',
                    withStack: true,
                },
                cookie,
            );
            
            // Если ошибка с сервера истечения времени запроса инвентаря
            if (items.error === 4) {
                this.setError(4);
                return;
            }
            
            // Очищение ошибки
            this.setError(undefined);
            
            // Не удалось получить предметы
            if (!items.items) {
                return;
            }
            
            // Инвентарь пуст
            if (!items.items.length > 0) {
                this.setItems([]);
                return;
            }
            
            this.setItems(items.items);
        } catch (error) {
            console.log('Ошибка при обновлении инвентаря', error);
        } finally {
            startReload();
        }
    },
};

export default myInventoryLoader;
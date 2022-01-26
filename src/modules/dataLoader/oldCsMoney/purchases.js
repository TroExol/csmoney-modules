import {get} from '../../senders/index.js';
import {defaultSetting} from '../../../helpers/index.js';

/**
 * Список транзакций пользователя.
 */
export const purchasesLoader = ({
    setTimeout,
    console,
    get,
    defaultSetting,
}) => ({
    accounts: {},
    
    /**
     * Получение покупок и продаж.
     * @param {string} keyAccount - Ключ к нужному аккаунту.
     * @returns {Object[] | undefined}
     */
    get (keyAccount) {
        return this.accounts[keyAccount];
    },
    
    /**
     * Получение предметов в инвентаре.
     * @param {string} keyAccount - Ключ к нужному аккаунту.
     * @returns {Object[] | undefined}
     */
    getItemsInInventory (keyAccount) {
        return this.accounts[keyAccount]?.filter(item => item.status === 'inventory');
    },
    
    /**
     * Обновление покупок и продаж с сервера.
     * @param {Object<string, string>} cookie - Куки файлы старой версии CSM.
     *
     * @param {object} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением покупок и продаж.
     *
     * @param {array} requiredAccounts - Массив с ключами ко всем аккаунтам.
     *
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.purchases,
        requiredAccounts = defaultSetting.keyAccounts) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, requiredAccounts), repeatLoad.delay);
        
        try {
            for (const keyAccount of requiredAccounts) {
                // Получение покупок и продаж
                const purchases = await get('https://old.cs.money/get_purchases', null, cookie[keyAccount]);
                
                if (purchases && Array.isArray(purchases)) {
                    this.accounts[keyAccount] = purchases;
                }
            }
        } catch (error) {
            console.log('Ошибка при получении списка покупок и продаж', error);
        } finally {
            startReload();
        }
    },
});

export default purchasesLoader({
    setTimeout,
    console,
    get,
    defaultSetting,
});
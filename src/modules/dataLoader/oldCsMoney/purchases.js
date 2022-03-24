import {get} from '../../senders/index.js';
import {defaultSetting} from '../../../helpers/index.js';
import chalk from 'chalk';

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
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @returns {Object[] | undefined}
     */
    get (accountId) {
        return this.accounts[accountId];
    },
    
    /**
     * Получение предметов в инвентаре.
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @returns {Object[] | undefined}
     */
    getItemsInInventory (accountId) {
        return this.accounts[accountId]?.filter(item => item.status === 'inventory');
    },
    
    /**
     * Обновление покупок и продаж с сервера.
     * @param {Object<string, string>} cookie - Куки файлы старой версии CSM.
     *
     * @param {object?} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением покупок и продаж.
     *
     * @param {array?} requiredAccounts - Массив с ключами ко всем аккаунтам.
     *
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.purchases,  
        requiredAccounts = defaultSetting.getAccountIds()) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, requiredAccounts), repeatLoad.delay);
        
        try {
            for (const accountId of requiredAccounts) {
                console.log(`Загрузка покупок для аккаунта ${accountId}`);
                // Получение покупок и продаж
                const purchases = await get('https://old.cs.money/get_purchases', null, cookie || {oldCsm: true, accountId});
                
                if (purchases && Array.isArray(purchases)) {
                    this.accounts[accountId] = purchases;
                }
            }
        } catch (error) {
            console.log(chalk.red.underline('Ошибка при получении списка покупок и продаж'), error);
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
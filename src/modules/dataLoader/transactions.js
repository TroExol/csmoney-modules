import {get} from '../senders/index.js';
import {defaultSetting} from '../../helpers/index.js';

/**
 * Список транзакций пользователя.
 */
export const transactionsLoader = ({
    setTimeout,
    console,
    get,
    defaultSetting,
}) => ({
    accounts: {},
    
    /**
     * Получение транзакций.
     * @param {string} keyAccount - Ключ к нужному аккаунту.
     * @returns {Object[] | undefined}
     */
    get (keyAccount) {
        return this.accounts[keyAccount];
    },
    
    /**
     * Обновление транзакций с сервера.
     * @param {Object<string, string>} cookie - Куки файлы старой версии CSM.
     *
     * @param {object} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением транзакций.
     *
     * @param {array} requiredAccounts - Массив с ключами ко всем аккаунтам.
     *
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.transactions,
        requiredAccounts = defaultSetting.keyAccounts) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, requiredAccounts), repeatLoad.delay);
        
        try {
            for (const keyAccount of requiredAccounts) {
                // Получение транзакций
                const transactions = await get('https://old.cs.money/get_transactions', null, cookie[keyAccount]);
                
                if (transactions && Array.isArray(transactions)) {
                    this.accounts[keyAccount] = transactions;
                }
            }
        } catch (error) {
            console.log('Ошибка при получении списка транзакций', error);
        } finally {
            startReload();
        }
    },
});

export default transactionsLoader({
    setTimeout,
    console,
    get,
    defaultSetting,
});
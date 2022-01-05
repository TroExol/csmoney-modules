import {get} from '../senders/index.js';
import {defaultSetting} from '../../helpers/index.js';

/**
 * Мой баланс
 */
const myBalance = {
    accounts: {},
    
    /**
     * Уменьшение баланса
     * @param {string} keyAccounts - Ключ к нужному аккаунту.
     * @param {number} amount - Сумма
     */
    decrease (keyAccounts, amount) {
        this.accounts[keyAccounts] -= amount;
    },
    
    /**
     * Увеличение баланса
     * @param {string} keyAccounts - Ключ к нужному аккаунту.
     * @param {number} amount - Сумма
     */
    increase (keyAccounts, amount) {
        this.accounts[keyAccounts] += amount;
    },
    
    /**
     * Получение баланса
     * @param {string} [keyAccounts] - Ключ к нужному аккаунту.
     * @returns {number || undefined}
     */
    get (keyAccounts) {
        return keyAccounts ? this.accounts[keyAccounts] : this.accounts;
    },
    
    /**
     * Обновление баланса с сервера
     * @param {string} cookie - Куки
     * 
     * @param {object} repeatLoad - Обновлять ли повторно
     * @param {boolean} repeatLoad.status - Обновлять ли повторно 
     * @param {number} repeatLoad.delay - Таймаут перед обновлением списка
     * 
     * @param {array} appIdList - Массив с id нужных игр. 
     * 
     * @param {array} requiredAccounts - Массив с ключами ко всем аккаунтам нужных игр. 
     * 
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.balance, requiredAccounts = defaultSetting.keyAccounts) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, requiredAccounts), repeatLoad.delay);
        
        try {
            for (const keyAccount of requiredAccounts) {
                // Получение баланса
                const userInfo = await get('https://old.cs.money/user_info', null, cookie[keyAccount]);

                // Не удалось получить баланс
                if (!userInfo.balance && userInfo.balance !== 0) {
                    return;
                }
                this.accounts[keyAccount] = userInfo.balance;
            }
        } catch (error) {
            console.log('Ошибка при обновлении баланса', error);
        } finally {
            startReload();
        }
    },
};

export default myBalance;
import {get} from '../../senders/index.js';
import {defaultSetting} from '../../../helpers/index.js';
import chalk from 'chalk';

/**
 * Мой баланс
 */
export const myBalance = ({
    setTimeout,
    get,
    console,
    defaultSetting,
}) => ({
    accounts: {},
    
    /**
     * Уменьшение баланса
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @param {number} amount - Сумма
     */
    decrease (accountId, amount) {
        this.accounts[accountId] -= amount;
    },
    
    /**
     * Увеличение баланса
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @param {number} amount - Сумма
     */
    increase (accountId, amount) {
        this.accounts[accountId] += amount;
    },
    
    /**
     * Получение баланса
     * @param {string} [accountId] - Ключ к нужному аккаунту.
     * @returns {number | object | undefined}
     */
    get (accountId) {
        return accountId ? this.accounts[accountId] : this.accounts;
    },
    
    /**
     * Обновление баланса с сервера
     * @param {Object<string, string>?} cookie - Куки
     *
     * @param {object?} repeatLoad - Обновлять ли повторно
     * @param {boolean} repeatLoad.status - Обновлять ли повторно
     * @param {number} repeatLoad.delay - Таймаут перед обновлением списка
     *
     * @param {array?} requiredAccounts - Массив с ключами ко всем аккаунтам нужных игр.
     *
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.balance, requiredAccounts = defaultSetting.getAccountIds()) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, requiredAccounts), repeatLoad.delay);
        
        try {
            for (const accountId of requiredAccounts) {
                console.log(`Загрузка баланса для аккаунта ${accountId}`);
                // Получение баланса
                const userInfo = await get('https://old.cs.money/user_info', null, cookie?.[accountId] || {oldCsm: true, accountId});
                    
                // Не удалось получить баланс
                if (!userInfo.balance && userInfo.balance !== 0) {
                    continue;
                }
                this.accounts[accountId] = userInfo.balance;
            }
        } catch (error) {
            console.log(chalk.red.underline('Ошибка при обновлении баланса'), error);
        } finally {
            startReload();
        }
    },
});

export default myBalance({
    setTimeout,
    get,
    console,
    defaultSetting,
});
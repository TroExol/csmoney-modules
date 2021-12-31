import {get} from '../senders';

/**
 * Мой баланс
 */
const myBalanceLoader = {
    _balance: undefined,
    
    /**
     * Изменение баланса
     * @param {number} balance - Баланс
     */
    set (balance) {
        this._balance = balance;
    },
    
    /**
     * Уменьшение баланса
     * @param {number} amount - Сумма
     */
    decrease (amount) {
        this._balance -= amount;
    },
    
    /**
     * Увеличение баланса
     * @param {number} amount - Сумма
     */
    increase (amount) {
        this._balance += amount;
    },
    
    /**
     * Получение баланса
     * @returns {number || undefined}
     */
    get () {
        return this._balance;
    },
    
    /**
     * Обновление баланса с сервера
     * @param {string} cookie - Куки
     * @param {Boolean} repeatLoad - Обновлять ли повторно
     * @param {number} reloadMyBalanceTimeout - Таймаут перед обновлением баланса
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = false, reloadMyBalanceTimeout = 0) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad &&
            setTimeout(() => this.load(cookie, repeatLoad, reloadMyBalanceTimeout), reloadMyBalanceTimeout);
        
        try {
            // Получение баланса
            const balance = await get('https://old.cs.money/user_info', null, cookie);
            // Не удалось получить баланс
            if (!balance.balance) {
                startReload();
                return;
            }
            
            this.set(balance.balance);
        } catch (error) {
            console.log('Ошибка при обновлении баланса', error);
        } finally {
            startReload();
        }
    },
};

export default myBalanceLoader;
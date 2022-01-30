import {get} from '../../senders/index.js';
import {defaultSetting} from '../../../helpers/index.js';

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
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @returns {Object[] | undefined}
     */
    get (accountId) {
        return this.accounts[accountId];
    },
    
    /**
     * Получение списка offerId в статусе ожидания подтверждения.
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @returns {number[] | undefined}
     */
    getPendingOfferIds (accountId) {
        if (!this.accounts[accountId]) {
            return undefined;
        }
        
        const offerIds = [];
        
        for (const transactions of this.accounts[accountId]) {
            const offerId = Object.values(transactions)
                .map(transaction => transaction.trades
                    ?.filter(trade => trade.status === 'pending')
                    ?.map(trade => trade.offer_id))
                .flat()
                .filter(offerId => offerId);
            offerId && offerIds.push(...offerId);
            
            // Выход, если обмен происходил давно
            if (Object.values(transactions)
                .some(transaction => transaction.trades?.[0]?.time * 1000 <= Date.now() - 60 * 60000)) {
                return offerIds;
            }
        }
        
        return offerIds;
    },
    
    /**
     * Получение offerId по id обмена
     * @param {Object<string, string>} cookie - Куки файлы старой версии CSM.
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @param {number} merchantId - Id обмена.
     * @returns {number | undefined}
     */
    async getOfferId (cookie, accountId, merchantId) {
        await this.load(cookie, {status: false, delay: 0}, [accountId]);
        
        if (!this.accounts[accountId]) {
            return undefined;
        }
        
        for (const transactions of this.accounts[accountId]) {
            for (const transaction of Object.values(transactions)) {
                for (const trade of transaction.trades) {
                    if (trade.merchant_id === merchantId) {
                        return trade.offer_id;
                    }
                }
            }
        }
    },
    
    /**
     * Обновление транзакций с сервера.
     * @param {Object<string, string>} cookie - Куки файлы старой версии CSM.
     *
     * @param {object?} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением транзакций.
     *
     * @param {array?} requiredAccounts - Массив с ключами ко всем аккаунтам.
     *
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.transactions,
        requiredAccounts = defaultSetting.getAccountIds()) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, requiredAccounts), repeatLoad.delay);
        
        try {
            for (const accountId of requiredAccounts) {
                // Получение транзакций
                const transactions = await get('https://old.cs.money/get_transactions', null, cookie[accountId]);
                
                if (transactions && Array.isArray(transactions)) {
                    this.accounts[accountId] = transactions;
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
import {defaultSetting} from '../../helpers/index.js';
import {transactions} from '../../modules/dataLoader/index.js';
import replyToOffer from './replyToOffer.js';

export const confirmOffersRecursively = ({
    transactions,
    replyToOffer,
    defaultSetting,
    console,
    setTimeout,
}) =>
    /**
     * Подтверждение офферов
     * @param {Object<string, string>} cookie - Куки файлы старой версии CSM.
     * @param {object?} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением.
     * @returns {Promise<void>}
     */
    async (cookie, repeatLoad = defaultSetting.repeatLoad.confirmOffer) => {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => confirmOffersRecursively({defaultSetting, transactions, replyToOffer, console, setTimeout})(cookie, repeatLoad), repeatLoad.delay);
        
        try {
            for (const accountId of defaultSetting.getAccountIds()) {
                const pendingTradeOfferIds = await transactions.getPendingOfferIds(cookie, accountId);
    
                for (const offerId of pendingTradeOfferIds) {
                    replyToOffer(offerId, 'confirm', cookie[accountId]);
                }
            }
        } catch (error) {
            console.log('confirmOffers unexpected error:', error);
        } finally {
            startReload();
        }
    };

export default confirmOffersRecursively({
    transactions,
    replyToOffer,
    defaultSetting,
    console,
    setTimeout,
});
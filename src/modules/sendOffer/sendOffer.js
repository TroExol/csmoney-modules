import {post} from '../senders/index.js';
import {countBadQueries} from '../generalInfo/index.js';

/**
 * Подтверждение оффера
 * @param {Object[]} items - Предметы на обмен
 * @param {boolean} isVirtual - Обмен по стиму или мани
 * @param {boolean} isBuy - Покупка или продажа
 * @param {string} cookie - Куки аккаунта
 * @param {string} accountId - Ключ к нужному аккаунту
 * @returns {Promise<number | false>} - Id обмена
 */
const sendOffer = async ({items, isVirtual, isBuy, cookie, accountId}) => {
    try {
        if (!countBadQueries.canSend(accountId)) {
            return false;
        }
        
        const response = await post('https://cs.money/2.0/send_offer', {
            balance: items.reduce((sum, item) => sum + item.price, 0) * (isBuy ? -1 : 1),
            games: {},
            isVirtual,
            skins: {
                bot: isBuy ? items : [],
                user: !isBuy ? items : [],
            },
        }, cookie || {newCsm: true, accountId});
        
        // Не удалось подтвердить
        if (response?.error) {
            console.log('sendOffer response on error:', response);
            countBadQueries.increase(accountId);
            return false;
        }
        
        const offerId = response?.offers?.[0]?.offer_id;
        
        if (!offerId) {
            return false;
        }
        
        return offerId;
    } catch (error) {
        console.log('sendOffer unexpected error:', error);
        return false;
    }
};

export default sendOffer;
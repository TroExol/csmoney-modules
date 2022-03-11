import {post} from '../senders/index.js';
import {buyingProcesses, countBadQueries, sellingProcesses} from '../generalInfo/index.js';

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
        
        let clearItems = [...items];
        
        for (const item of clearItems) {
            if (isBuy) {
                if (buyingProcesses.isBuying(accountId, item.id)) {
                    continue;
                }
    
                console.log(`Предмет ${item.fullName} уже в процессе покупки`);
                clearItems = clearItems.filter(({id}) => id !== item.id);
            } else {
                if (sellingProcesses.isSelling(accountId, item.id)) {
                    continue;
                }
                
                console.log(`Предмет ${item.fullName} уже в продаже`);
                clearItems = clearItems.filter(({id}) => id !== item.id);
            }
        }
        
        if (!clearItems.length) {
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
import {post} from '../senders/index.js';
import {balance, myInventory} from '../dataLoader/index.js';
import {permissionSendOffer} from '../generalInfo/index.js';

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
        if (!permissionSendOffer.canSend(accountId)) {
            return false;
        }
        const price = Number(items.reduce((sum, item) => sum + item.price, 0));
        const response = await post('https://cs.money/2.0/send_offer', {
            balance: price * (isBuy ? -1 : 1),
            games: {},
            isVirtual,
            skins: {
                bot: isBuy ? items : [],
                user: !isBuy ? items : [],
            },
        }, cookie || {newCsm: true, accountId});
        
        // Не удалось подтвердить
        if (response?.error) {
            if (response.error === 9999) {
                permissionSendOffer.setTimeOut();
            }

            console.log('sendOffer response on error:', response);
            permissionSendOffer.increase(accountId);
            return false;
        }
        
        const offerId = response?.offers?.[0]?.offer_id;
        
        if (!offerId) {
            return false;
        }
    
        if (isBuy) {
            balance.decrease(accountId, price);
            for (const item of items) {
                myInventory.add(accountId, item);
            }
        } else {
            balance.increase(accountId, price);
            for (const item of items) {
                myInventory.remove(accountId, item);
            }
        }
        
        return offerId;
    } catch (error) {
        console.log('sendOffer unexpected error:', error);
        return false;
    }
};

export default sendOffer;
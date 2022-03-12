import {sendOfferRecursively} from '../sendOffer/index.js';
import {replyToOffer} from '../replyToOffer/index.js';

/**
 * Продажа предмета
 * @param {Object[]} items - Предметы на продажу
 * @param {boolean} isVirtual - Обмен по стиму или мани
 * @param {string} cookie - Куки аккаунта
 * @param {string} accountId - Ключ к нужному аккаунту
 * @param {number?} recursivelyDuration - Длительность отправки запросов (в миллисекундах)
 * @param {number?} recursivelyFrequency - Периодичность отправки запросов (в миллисекундах)
 * @returns {Promise<boolean>} - Результат продажи
 */
const sell = async ({
    items,
    isVirtual,
    cookie,
    accountId,
    recursivelyDuration,
    recursivelyFrequency,
}) => {
    try {
        const offerId = await sendOfferRecursively({
            items,
            isVirtual,
            isBuy: false,
            cookie,
            accountId,
            recursivelyDuration,
            recursivelyFrequency,
        });
        
        if (!offerId) {
            return false;
        }
        
        if (isVirtual) {
            await replyToOffer({offerId, action: 'confirm', cookie, accountId});
    
            //TODO: в файле в предмете ставится флаг, что предмет продан. Желательно сделать отдельной функцией,
            // чтобы можно было вызвать при подтверждении обмена в стиме, если продажа из инвентаря стима (хз будет ли такой кейс)
        }
        
        return true;
    } catch (error) {
        console.log('sell unexpected error:', error);
        return false;
    }
};

export default sell;
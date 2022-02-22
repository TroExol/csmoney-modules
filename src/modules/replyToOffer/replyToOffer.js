import {post} from '../senders/index.js';

export const replyToOffer = ({post}) =>
    /**
     * Подтверждение оффера
     * @param {number | string} offerId - Id обмена
     * @param {'confirm' | 'decline'} action - Подтвердить или отменить обмен
     * @param {string} cookie - Куки аккаунта
     * @returns {Promise<Object>} - Результат принятия обмена
     */
    async ({offerId, action, cookie, accountId}) => {
        try {
            const response = await post('https://cs.money/confirm_virtual_offer', {
                action: action,
                offer_id: offerId.toString(),
            }, cookie || {newCsm: true, accountId});
            
            // Не удалось подтвердить
            if (!response.status) {
                console.log('replyToOffer response on error:', response);
                return false;
            }
            
            return true;
        } catch (error) {
            console.log('replyToOffer unexpected error:', error);
            return false;
        }
    };

export default replyToOffer({post});
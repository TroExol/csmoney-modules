import {post} from '../senders/index.js';
import {permissionSendOffer} from '../generalInfo/index.js';
import chalk from 'chalk';

export const replyToOffer = ({post}) =>
    async ({offerId, action, cookie, accountId}) => {
        try {
            if (!permissionSendOffer.canSend(accountId)) {
                return false;
            }
            
            const response = await post('https://cs.money/confirm_virtual_offer', {
                action: action,
                offer_id: offerId.toString(),
            }, cookie || {newCsm: true, accountId});
            
            // Не удалось подтвердить
            if (!response.status) {
                console.log(chalk.red.underline('replyToOffer response on error:'), response);
                permissionSendOffer.increase(accountId);
                return false;
            }
            
            return true;
        } catch (error) {
            console.log(chalk.red.underline('replyToOffer unexpected error:'), error);
            return false;
        }
    };

/**
 * Подтверждение оффера
 * @param {number | string} offerId - Id обмена
 * @param {'confirm' | 'decline'} action - Подтвердить или отменить обмен
 * @param {string} cookie - Куки аккаунта
 * @param {string} accountId - Ключ к нужному аккаунту.
 * @returns {Promise<Object>} - Результат принятия обмена
 */
export default replyToOffer({post});
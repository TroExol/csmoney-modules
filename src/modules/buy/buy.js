import {sendOfferRecursively} from '../sendOffer/index.js';
import {replyToOffer} from '../replyToOffer/index.js';
import chalk from 'chalk';

/**
 * Покупка предмета
 * @param {Object[]} items - Предметы на покупку
 * @param {boolean} isVirtual - Обмен по стиму или мани
 * @param {string} cookie - Куки аккаунта
 * @param {string} accountId - Ключ к нужному аккаунту
 * @param {number?} recursivelyDuration - Длительность отправки запросов (в миллисекундах)
 * @param {number?} recursivelyFrequency - Периодичность отправки запросов (в миллисекундах)
 * @returns {Promise<boolean>} - Результат покупки
 */
const buy = async ({
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
            isBuy: true,
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
    
            for (const item of items) {
                console.log(chalk.green(`Куплен предмет: ${item.name}; Цена: ${item.cp || item.p}; Скидка: ${item.pd}`));
            }
            //TODO: в файле покупок добавить предмет
        }
        
        return true;
    } catch (error) {
        console.log(chalk.red.underline('buy unexpected error:'), error);
        return false;
    }
};

export default buy;
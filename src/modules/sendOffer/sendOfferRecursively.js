import {defaultSetting} from '../../helpers/index.js';
import {sendOffer} from './index.js';
import {permissionSendOffer, reservedItems} from '../generalInfo/index.js';
import chalk from 'chalk';

/**
 * Подтверждение оффера
 * @param {Object[]} items - Предметы на обмен
 * @param {boolean} isVirtual - Обмен по стиму или мани
 * @param {boolean} isBuy - Покупка или продажа
 * @param {string} cookie - Куки аккаунта
 * @param {string} accountId - Ключ к нужному аккаунту
 * @param {number?} recursivelyDuration - Длительность отправки запросов (в миллисекундах)
 * @param {number?} recursivelyFrequency - Периодичность отправки запросов (в миллисекундах)
 * @returns {Promise<number | false>} - Id оффера
 */
const sendOfferRecursively = async ({
    items,
    isVirtual,
    isBuy,
    cookie,
    accountId,
    recursivelyDuration,
    recursivelyFrequency,
}) => {
    try {
        if (!permissionSendOffer.canSend(accountId)) {
            return false;
        }
        
        recursivelyDuration = recursivelyDuration || (isBuy
            ? defaultSetting.buyRecursivelyDuration
            : defaultSetting.sellRecursivelyDuration);
        recursivelyFrequency = recursivelyFrequency || (isBuy
            ? defaultSetting.buyRecursivelyFrequency
            : defaultSetting.sellRecursivelyFrequency);
        
        const startTime = Date.now();
        
        while (Date.now() - startTime <= recursivelyDuration) {
            if (isBuy && items.some(item => reservedItems.isReserved(item.id))) {
                console.log(chalk.yellow('В списке для покупки есть зарезервированный другим пользователем предмет'));
                break;
            }
            
            const iterationStartTime = Date.now();
            
            const offerId = await sendOffer({items, isVirtual, isBuy, cookie, accountId});
            
            if (offerId) {
                return offerId;
            }
            
            // Если время выполнения запроса меньше частоты отправки запросов
            if (Date.now() - iterationStartTime < recursivelyFrequency) {
                //Оставшееся время задержки между запросами
                const leftTime = recursivelyFrequency - (Date.now() - iterationStartTime);
                // Задержка между запросами
                await new Promise(resolve => setTimeout(resolve, leftTime));
            }
        }
        
        return false;
    } catch (error) {
        console.log(chalk.red.underline('sendOfferRecursively unexpected error:'), error);
        return false;
    }
};

export default sendOfferRecursively;
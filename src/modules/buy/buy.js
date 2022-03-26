import {sendOffer} from '../sendOffer/index.js';
import {replyToOffer} from '../replyToOffer/index.js';
import {defaultSetting} from '../../helpers/index.js';
import chalk from 'chalk';

export const recursiveBuy = async(item, accountId, delay = 0, isVirtual = true) => {
    try {
        if (delay) {
            console.log(`Задержка перед покупкой ${delay} ms.`);
            await new Promise(resolve => setTimeout(resolve, delay)); 
            console.log('Задержка перед покупкой завершена.');
        }

        // Время начала рекурсивной покупки
        const timeStamp = Date.now();

        // Счетчик количества запросов на покупку.
        let numberOfRequest = 1;

        // Цикл, для попытки повторить покупку // Условие для цикла: установленный лимит времени
        while (Date.now() - timeStamp < defaultSetting.buyRecursivelyDuration) {

            // Начало времени для одной попытки 
            const innerTimeStamp = Date.now(); 

            const offerId = await sendOffer({
                items: item,
                isVirtual,
                isBuy: true,
                accountId
            });

            if(!offerId) {
                return false;
            }
   
            const confirmOffer = await replyToOffer({offerId, action: 'confirm', accountId});

            if (confirmOffer) {
                console.log(chalk.green(`Куплен предмет: ${item.name}; Цена: ${item.cp || item.p}; Куплено с попытки: ${numberOfRequest}`));
                return true;
            }

            // Остаток времени для задержки между попытками 
            const restOfTime = defaultSetting.buyRecursivelyFrequency - (Date.now() - innerTimeStamp);
            await new Promise(resolve => setTimeout(resolve, restOfTime));
            numberOfRequest++;
        }
     
        
    } catch (error) {
        console.log(chalk.red.underline('recursiveBuy error:'), error);
    }
};

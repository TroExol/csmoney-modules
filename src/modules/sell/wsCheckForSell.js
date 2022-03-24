import {sell} from './index.js';
import {ws} from '../senders/index.js';
import {purchases} from '../dataLoader/index.js';
import {defaultSetting, formatItemFromOldToNew} from '../../helpers/index.js';
import {sellingProcesses} from '../generalInfo/index.js';
import chalk from 'chalk';

/**
 * Проверка предметов на продажу из вебсокета
 * @param {Object<string, string>} cookie - Куки
 * @param {array?} requiredAccounts - Массив с ключами ко всем аккаунтам нужных игр
 * @returns {Promise<boolean>} - Результат продажи
 */
const wsCheckForSell = ({
    cookie,
    requiredAccounts = defaultSetting.getAccountIds(),
}) => {
    try {
        const callback = response => {
            if (response.event !== 'update_list_overstock') {
                return;
            }
            
            /**
             * Названия предметов, вышедших из оверстока
             * @type {string[]}
             */
            const availableItemNames = Object.entries(response.data)
                .filter(item => item[1] === 'both_side')
                .map(item => item[0]);
            
            // Нет доступных предметов
            if (availableItemNames.length <= 0) {
                return;
            }
            
            for (const accountId of requiredAccounts) {
                const items = purchases.getItemsInInventory(accountId);
                
                for (const item of items) {
                    const formattedItem = formatItemFromOldToNew(Number(item.appid), {
                        id: [item.user_skin_id],
                        // eslint-disable-next-line id-length
                        o: item.name_id,
                        vi: [1],
                        // eslint-disable-next-line id-length
                        p: item.price,
                    });
                    
                    if (!formattedItem.fullName) {
                        console.log(chalk.yellow(`Не удалось найти название предмета с nameId ${formattedItem.nameId}`));
                        continue;
                    }
                    
                    if (!availableItemNames.includes(formattedItem.fullName)) {
                        continue;
                    }
                    
                    if (sellingProcesses.countProcesses(accountId) >= defaultSetting.maxCountParallelsSelling) {
                        console.log(chalk.yellow(`Превышено кол-во одновременных процессов продажи (${sellingProcesses.countProcesses(accountId)})`));
                        break;
                    }
                    
                    if (sellingProcesses.isSelling(accountId, formattedItem.id)) {
                        console.log(chalk.yellow(`Предмет ${formattedItem.fullName} уже в продаже`));
                        continue;
                    }
                    
                    const processId = Symbol();
                    
                    // Добавление процесса продажи
                    sellingProcesses.add(accountId, processId, [formattedItem.id]);
                    
                    //TODO: смотреть в файле, что предмет куплен ботом
                    
                    // Замыкание для того, чтобы по окончании продажи удалились правильные id
                    (() => {
                        const innerProcessId = processId;
                        const innerItemIds = [formattedItem.id];
                        
                        sell({
                            items: [formattedItem],
                            isVirtual: true,
                            cookie: cookie?.[accountId] || null,
                            accountId,
                        }).then(() =>
                            // Удаление процесса продажи
                            sellingProcesses.remove(accountId, innerProcessId, innerItemIds));
                    })();
                }
            }
        };
    
        ws(cookie?.[requiredAccounts[0]] || {oldCsm: true, accountId: requiredAccounts[0]}, callback)
            .finally(() =>
                setTimeout(() =>
                    wsCheckForSell({cookie, requiredAccounts}), defaultSetting.delayReconnectWS));
    } catch (error) {
        console.log(chalk.red.underline('wsCheckForSell unexpected error:'), error);
    }
};

export default wsCheckForSell;
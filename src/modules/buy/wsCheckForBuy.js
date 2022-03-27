import {buy} from './index.js';
import {ws} from '../senders/index.js';
import {itemStatus} from '../dataLoader/index.js';
import {dateToString, defaultSetting, formatItemFromOldToNew} from '../../helpers/index.js';
import {buyingProcesses} from '../generalInfo/index.js';
import chalk from 'chalk';

/**
 * Проверка предметов на продажу из вебсокета
 * @param {Object<string, string>} cookie - Куки
 * @param {array?} requiredAccounts - Массив с ключами ко всем аккаунтам нужных игр
 * @returns {Promise<boolean>} - Результат продажи
 */
const wsCheckForBuy = ({
    cookie,
    requiredAccounts = defaultSetting.getAccountIds(),
}) => {
    try {
        const callback = response => {
            if (!defaultSetting.appIdList.reduce((acc, appId) => `add_items_${appId}`, []).includes(response.event)) {
                return;
            }
            
            const appId = Number(response.event.match(/\d+/)[0]);
    
            console.log(`Получено сообщение о новых предметах игры ${appId} от ${dateToString(new Date())}`);
    
            // Сортировка от наибольшей скидки к меньшей
            const items = response.data
                .filter(({pd}) => pd)
                .sort((item1, item2) => item1.pd - item2.pd);
            
            const statuses = itemStatus.get(appId);
    
            if (Object.keys(statuses).length === 0) {
                console.log(chalk.yellow(`Статусы игры ${appId} не обновлены`));
                return;
            }
    
            for (const accountId of requiredAccounts) {
                for (const item of items) {
                    const formattedItem = formatItemFromOldToNew(appId, item);
        
                    if (!formattedItem.fullName) {
                        console.log(chalk.yellow(`Не удалось найти название предмета с nameId ${formattedItem.nameId}`));
                        continue;
                    }
        
                    if (!itemStatus.check(formattedItem.fullName, appId, defaultSetting.limitOverstock[accountId])) {
                        continue;
                    }
        
                    const status = itemStatus.get(appId)[formattedItem.fullName];
        
                    // Не популярен
                    if (!formattedItem.hasHighDemand) {
                        // В оверстоке или профит не подходит
                        if (typeof status === 'number' || formattedItem.overprice > -defaultSetting.profitOverstock[accountId]) {
                            continue;
                        }
                        // Без хорошей скидки
                    } else if (formattedItem.overprice > -defaultSetting.profitNotOverstock[accountId]) {
                        continue;
                    } else if (formattedItem.overprice <= -defaultSetting.profitNotOverstock[accountId]
                        && item.cp > item.p * (1 - defaultSetting.commission[accountId] / 100)) {
                        console.log(chalk.yellow(
                            `Цена ${formattedItem.fullName} со скидкой ${formattedItem.overprice}% больше обычной цены: cp ${item.cp}$, p ${item.p}$`
                        ));
                        continue;
                    }
        
                    console.log(chalk.green(`Выгодный предмет ${formattedItem.fullName}; Цена: ${formattedItem.price}; Скидка: ${formattedItem.overprice}`));
    
                    if (defaultSetting.blacklist.some(black => formattedItem.fullName.includes(black))) {
                        console.log(chalk.yellow(`Предмет ${formattedItem.fullName} игры ${appId} находится в черном списке`));
                        continue;
                    }
    
                    if (buyingProcesses.countProcesses(accountId) >= defaultSetting.maxCountParallelsBuying[accountId]) {
                        console.log(chalk.yellow(`Превышено кол-во одновременных процессов покупки (${buyingProcesses.countProcesses(accountId)})`));
                        break;
                    }
    
                    if (buyingProcesses.isBuying(accountId, formattedItem.id)) {
                        console.log(chalk.yellow(`Предмет ${formattedItem.fullName} уже в покупке`));
                        continue;
                    }
                    
                    if (buyingProcesses.wasInBuying(accountId, formattedItem.id)) {
                        console.log(chalk.yellow(`Предмет ${formattedItem.fullName} уже был в процессе покупки на аккаунте ${accountId}`));
                        continue;
                    }
                    
                    const processId = Symbol();
        
                    // Добавление процесса продажи
                    buyingProcesses.add(accountId, processId, [formattedItem.id]);
        
                    (() => {
                        console.log(`Начало покупки предмета ${formattedItem.fullName}`);
                        
                        const innerProcessId = processId;
                        const innerItemIds = [formattedItem.id];
            
                        buy({
                            items: [formattedItem],
                            isVirtual: true,
                            cookie: cookie?.[accountId] || null,
                            accountId,
                        }).then(() =>
                            // Удаление процесса покупки
                            buyingProcesses.remove(accountId, innerProcessId, innerItemIds));
                    })();
                }
            }
        };
    
        ws(cookie?.[requiredAccounts[0]] || {oldCsm: true, accountId: requiredAccounts[0]}, callback,
            () => console.log('Открыт WS для проверки новых предметов...'))
            .finally(() =>
                setTimeout(() =>
                    wsCheckForBuy({cookie, requiredAccounts}), defaultSetting.delayReconnectWS));
    } catch (error) {
        console.log(chalk.red.underline('wsCheckForSell unexpected error:'), error);
    }
};

export default wsCheckForBuy;
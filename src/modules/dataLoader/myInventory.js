import {get} from '../senders/index.js';
import {defaultSetting} from '../../helpers/index.js';
/**
 * Мой инвентарь
 */
const myInventory = {

    accounts: {},
    /**
     * Добавление предмета в мой инвентарь.
     * @param {string} keyAccounts - Ключ к нужному аккаунту.
     * @param {object} item - Объект с данными предмета, который был получен через WS.
     * @param {string | number} [appId] - id необходимой игры. 
     */
    add (keyAccount, item, appId) {
        if (!this.accounts[keyAccount][item.appId || appId][item.o]) {
            this.accounts[keyAccount][item.appId || appId][item.o] = {};
        }
        this.accounts[keyAccount][item.appId || appId][item.o][item.id[0]] = item;
    },
    
    /**
     * Удаление предмета из моего инвентаря
     * 
     * @param {string} keyAccounts - Ключ к нужному аккаунту.
     * @param {object} item - Объект с данными предмета, который был получен через WS.
     * @param {string | number} [appId] - id необходимой игры. 
     */
    remove (keyAccount, item, appId) {
        delete this.accounts[keyAccount][item.appId || appId][item.o][item];
    },
    
    /**
     * Получение инвентаря для всех аккаунтов.
     * @param {string} [keyAccounts] - Ключ к нужному аккаунту..
     * @returns {} - 
     */
    get (keyAccount) {
        return keyAccount ? this.accounts[keyAccount] : this.accounts;
    },
    
    /**
     * Обновление инвентаря с сервера.
     * @param {string} cookie - Куки файлы новой версии CSM.
     * 
     * @param {object} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением инвентаря.
     * 
     * @param {array} appIdList - Массив с id нужных игр.
     * 
     * @param {array} requiredAccounts - Массив с ключами ко всем аккаунтам. .
     * 
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.myinventory, appIdList = defaultSetting.appIdList, requiredAccounts = defaultSetting.keyAccounts) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, appIdList), repeatLoad.delay);
        
        try {
            for (const keyAccount of requiredAccounts) {
                // Проверка на существования данных для нужного аккаунта.
                if (!this.accounts[keyAccount]) {
                    this.accounts[keyAccount] = {
                        730: {},
                        570: {}
                    };
                }

                for (const appId of appIdList) {
                    const getMyinventory = await get(`https://old.cs.money/${appId}/load_user_inventory`, null, cookie[keyAccount]);
                    
                    if (!Array.isArray(getMyinventory)) {
                        // Обработка ошибки. (Надо доработать)
                        if (getMyinventory.error) {
                            this.accounts[keyAccount][appId].error = getMyinventory.error;
                        }
                    }
                    // Инвентарь пуст.
                    if (getMyinventory.length === 0) {
                        this[keyAccount][appId] = {};
                        return;
                    }

                    for (const item of getMyinventory) {
                        // Отсеиваем предметы, которые находятся в инвентаре Steam.
                        if (item.vi) {
                            if (!this.accounts[keyAccount][appId][item.o]) {
                                this.accounts[keyAccount][appId][item.o] = {};
                            }
                            // Разделяем одинаковые предметы.
                            for (const id of item.id) {
                                this.accounts[keyAccount][appId][item.o][id] = item;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Ошибка при обновлении инвентаря', error);
        } finally {
            startReload();
        }
    },
};


export default myInventory;
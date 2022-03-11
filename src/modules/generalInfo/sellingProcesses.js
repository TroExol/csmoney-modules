/**
 * Процессы продажи
 */
const sellingProcesses = {
    accounts: {},
    
    /**
     * Кол-во процессов продажи
     * @param {String} accountId - Id аккаунта
     * @returns {number}
     */
    countProcesses (accountId) {
        return this.accounts[accountId]
            ? this.accounts[accountId].processes.length
            : 0;
    },
    
    /**
     * Проверка предмета на продаже
     * @param {String} accountId - Id аккаунта
     * @param {Number} id - Id предмета
     * @returns {boolean}
     */
    isSelling (accountId, id) {
        return Boolean(this.accounts[accountId].items?.includes(id));
    },
    
    /**
     * Добавление процесса продажи
     * @param {String} accountId - Id аккаунта
     * @param {Symbol} id - Id процесса
     * @param {Number[]} itemIds - Id предметов
     */
    add (accountId, id, itemIds) {
        if (!this.accounts[accountId]) {
            this.accounts[accountId] = {
                processes: [],
                items: [],
            };
        }
        this.accounts[accountId].processes.push(id);
        this.accounts[accountId].items.push(...itemIds);
    },
    
    /**
     * Удаление процесса продажи
     * @param {String} accountId - Id аккаунта
     * @param {Symbol} id - Id процесса
     * @param {Number[]} itemIds - Id предметов
     */
    remove (accountId, id, itemIds) {
        if (!this.accounts[accountId]) {
            return;
        }
        
        this.accounts[accountId].processes = this.accounts[accountId].processes.filter(processId => processId !== id);
        this.accounts[accountId].items = this.accounts[accountId].items.filter(itemId => !itemIds.includes(itemId));
    },
};

export default sellingProcesses;
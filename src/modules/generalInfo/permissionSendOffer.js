import {defaultSetting} from '../../helpers/index.js';
import chalk from 'chalk';

const permissionSendOffer = {
    accounts: {},
    
    canSend (accountId) {
        if (!this.accounts[accountId] || Date.now() - this.accounts[accountId].startTime >= defaultSetting.badQueriesTime) {
            this.accounts[accountId] = {};
            this.accounts[accountId].count = 0;
            this.accounts[accountId].startTime = Date.now();
        }
        
        if (this.accounts[accountId].count >= defaultSetting.maxBadQueriesByTime) {
            console.log(chalk.yellow(`Достигнут порог отправки запросов за ${(defaultSetting.badQueriesTime / 60000).toFixed(2)} минут (${defaultSetting.maxBadQueriesByTime})`));
            return false;
        }

        if (this.accounts[accountId].banned) {
            console.log(chalk.red.underline(`Аккаунт ${accountId} был забанен.`));
            return false;
        }
        
        if (this.accounts[accountId].timeOut) {
            return false;
        }

        return true;
    },

    gotBanned (accountId) {
        if (!this.accounts[accountId]) {
            this.accounts[accountId] = {};
        }
        this.accounts[accountId].banned = true;
    },

    increase (accountId) {
        if (!this.accounts[accountId]) {
            this.accounts[accountId] = {};
            this.accounts[accountId].count = 0;
            this.accounts[accountId].startTime = Date.now();
        }
        
        this.accounts[accountId].count++;
    },
    
    setTimeOut (accountId, min = 10) {
        if (!this.accounts[accountId]) {
            this.accounts[accountId] = {};
        }
        
        this.accounts[accountId].timeOut = true;
        console.log(chalk.yellow(`Перерыв для аккаунта ${accountId} на ${min} минут :(`));

        setTimeout(() => {
            this.accounts[accountId].timeOut = false;
            console.log(chalk.green(`Перерыв для аккаунта ${accountId} закончен :)`));
        }, min * 60000);
    }
};

export default permissionSendOffer;
import WebSocket from 'ws';
import {isObject} from '../../helpers/index.js';
import {getCookies} from '../getCookies/index.js';
import chalk from 'chalk';

export const connectWS = ({
    WebSocket,
    console,
}) =>
    /**
     * Подключение к websocket old.cs.money
     * @param {string} cookie - Куки
     * @param {(string) => void} callback - Обработка сообщений от WS
     * @returns {Promise<any>} - Результат подключения (происходит при закрытии подключения)
     */
    (cookie, callback) => new Promise((resolve, reject) => {
        try {
            if (isObject(cookie)) {
                cookie = getCookies.getStrCookie(cookie);
            }
    
            // Открытие WS
            const ws = new WebSocket('wss://ws.cs.money/ws', {
                headers: {
                    Origin: 'https://old.cs.money/',
                    Cookie: cookie,
                },
            });
            
            ws.on('open', () => console.log('WS открыт...'));
            
            ws.on('message', message => {
                const response = JSON.parse(message);
                
                callback(response);
            });
    
            ws.on('error', reject);
            ws.on('close', resolve);
        } catch (error) {
            console.log(chalk.red.underline(`Произошла непредвиденная ошибка: ${error.message}`));
            reject(error);
        }
    });

export default connectWS({
    WebSocket,
    console,
});
import CryptoJS from 'crypto-js';
//import path from 'path';
import {writeFile, readFileSync, existsSync} from 'fs'

import {input} from '../../helpers/'

const database = {
    pass: undefined,
    path_cookies: '',
    path_steam_details: '',
}
const LifetimeOfCookies = 48 * (60 * 60000)

const getCookies = async() => {
    try {
        // Ждем ввод пароля для криптования cookie и данных steam
        database.pass = await input('Пароль шифрования: ')

        if (!database.pass) {
            console.log('Пароль не был введен.');
            return false;
        }
        // Проверяем существует ли файл с cookie
        if (!existsSync(path_cookie)) {
            /*---------------------------------*/
        } 
        
        const data = JSON.parse(fs.readFileSync(path_cookies, 'utf8'))
        
        // Проверяем не были ли просрочены файлы cookie
        if (Date.now() - data.time > LifetimeOfCookies) {
            /*---------------------------------*/
        }

        const bytes  = CryptoJS.AES.decrypt(data.cookies, database.pass);
        const cookies = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            if(await сheckСookies(cookies.old_csm.list)) {
              return cookies
            } else {
              return await logSteam()
            }
          } else {
            return await logSteam()
          }
        } else {
          return await logSteam()
        }
    } catch (e) {
      console.log('Error csm: ' + e);
    }
  }
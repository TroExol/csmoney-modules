import {isObject} from '../../../helpers/index.js';
/**
 * Генерация boundary, для установки в headers {'Content-Type': 'multipart/form-data; boundary=${boundary}'}
 * @param {Number} [stringLength] - Длина получаеой строки.
 * @param {String} [boundary] - Граница.
 * @returns {String}
 */
const generateBoundary = (stringLength = 15, boundary = '----WebKitFormBoundary') => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const pickRandom = () => possible[Math.floor(Math.random() * possible.length)];
    return boundary + Array.apply(null, Array(stringLength)).map(pickRandom)
        .join('');
};

/**
 * Создание body для запроса.
 * @param {Object} fields - Объект паропетров.
 * @param {String} boundary - Граница.
 * @returns {String}
 */
const formDataBody = (fields, boundary) => {
    let body = '';
  
    if (!boundary) {
        boundary = generateBoundary();
    } else if (typeof boundary !== 'string') {
        throw new TypeError(`${boundary} parameter should be a string.`);
    }

    if (fields && isObject(fields)) {
        for (let fieldName in fields) {
            let fieldData = fields[fieldName];
  
            if (Array.isArray(fieldData)) {
                fieldName += '[]';
            } else {
                fieldData = [fieldData];
            }
  
            if (!fieldData.length) {
                fieldData = [null];
            }
  
            fieldData.forEach(field => {
                if (field && isObject(field)) {
                    if (!field.name || typeof field.name !== 'string') {
                        throw new TypeError(`\`fields.${fieldName}.name\` should be a string.`);
                    } else if (!field.type || typeof field.type !== 'string') {
                        throw new TypeError(`\`fields.${fieldName}.type\` should be a string.`);
                    } else if (!field.data || typeof field.data !== 'string') {
                        throw new TypeError(`\`fields.${fieldName}.data\` should be a string.`);
                    } else {
                        body += `--${boundary}\r\n`;
                        body += `Content-Disposition: form-data; name="${fieldName}"; filename="${field.name}"\r\n`;
                        body += `Content-Type: ${field.type}\r\n\r\n`;
                        body += `${field.data}\r\n`;
                    }
                } else if (typeof field === 'string') {
                    body += `--${boundary}\r\n`;
                    body += `Content-Disposition: form-data; name="${fieldName}"\r\n\r\n`;
                    body += `${field}\r\n`;
                } else {
                    throw new TypeError(`\`fields.${fieldName}\` is an unsupported type, should be an object, string, or an array that contains those two types.`);
                }
            });
        }
  
        if (body.length) {
            body += `--${boundary}--\r\n`;
        }
        
    } else {
        throw new TypeError('`fields` parameter is required and should be an object.');
    }
  
    return body;
};
  
export {
    generateBoundary,
    formDataBody
};


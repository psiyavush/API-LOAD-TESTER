require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const url = process.env.BASE_URL;
const token = process.env.TOKEN;

// Параметры теста, которые вы настраиваете исходя из своих потребностей
const requestsPerSecond = 50; // Количество запросов в секунду
const durationInSeconds = 20; // Продолжительность теста

const totalRequests = requestsPerSecond * durationInSeconds;
let completedRequests = 0;

// Создание директории и файла для хранения результатов
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

const resultsFilePath = path.join(resultsDir, 'post_results.txt');
fs.writeFileSync(resultsFilePath, '');

// Флаг для записи результатов: true - все, false - только ошибки
const logAllResponses = false;

// Функция записи результата теста
const logResponse = (requestNumber, status, responseBody, timeTaken) => {
    const logEntry = `Запрос ${requestNumber}\nСтатус: ${status}\nВремя ответа: ${timeTaken}ms\nТело ответа: ${JSON.stringify(responseBody)}\n\n`;
    fs.appendFileSync(resultsFilePath, logEntry); // Записываем результат в файл
};

// Функция отправки POST-запроса
const sendPostRequest = async (data, requestNumber) => {
    const startTime = Date.now();
    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const timeTaken = Date.now() - startTime;
        if (logAllResponses) {
            logResponse(requestNumber, response.status, response.data, timeTaken);
        }
        completedRequests++;
    } catch (error) {
        const timeTaken = Date.now() - startTime;
        const status = error.response ? error.response.status : 'Неизвестная ошибка';
        const responseBody = error.response ? error.response.data : error.message;
        logResponse(requestNumber, status, responseBody, timeTaken);
    }
};

// Функция запуска теста
const startPostTest = () => {
    const dataTemplate = {
        // если данные статичные, записывает как обычно:
        key1: 'value1', 
        key2: 'value2',
        // если данные динамичные, генерирует случайные значения, записывает так
        key3: () => 'value3'
        // где value3 например может быть Math.floor(Math.random() * 9) + 1
    };

    const generateData = (template) => {
        if (Array.isArray(template)) {
            return template.map(item => generateData(item));
        } else if (typeof template === 'object' && template !== null) {
            const result = {};
            for (let key in template) {
                const value = template[key];
                if (typeof value === 'function') {
                    result[key] = value();
                } else if (typeof value === 'object') {
                    result[key] = generateData(value);
                } else {
                    result[key] = value;
                }
            }
            return result;
        } else {
            return template;
        }
    };

    const interval = setInterval(() => {
        for (let i = 0; i < requestsPerSecond; i++) {
            if (completedRequests < totalRequests) {
                const requestData = generateData(dataTemplate);
                sendPostRequest(requestData, completedRequests + 1);
            }
        }

        if (completedRequests >= totalRequests) {
            clearInterval(interval); 
            const summary = `Тест завершен. Отправлено ${completedRequests} POST-запросов.\n`; 
            fs.appendFileSync(resultsFilePath, summary); 
            console.log(summary.trim());
        }
    }, 1000);
};

// Запуск теста
startPostTest();
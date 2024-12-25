require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const url = process.env.BASE_URL; // Получаем базовый URL из файла .env
const token = process.env.TOKEN;   // Получаем токен из файла .env

// Параметры теста, которые вы настраиваете исходя из своих потребностей
const requestsPerSecond = 50; // Количество запросов в секунду
const durationInSeconds = 20; // Продолжительность теста в секундах

const totalRequests = requestsPerSecond * durationInSeconds;
let completedRequests = 0;

// Создание директории и файла для хранения результатов
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

const resultsFilePath = path.join(resultsDir, 'results.txt');
fs.writeFileSync(resultsFilePath, '');

// Флаг для записи результатов: true - все, false - только ошибки
const logAllResponses = false;

// Параметры GET-запроса
// Если хотите чтобы запросы выполнялись с одинаковыми значениями в параметрах:
const queryParams = [
    { param1: 'value1', param2: 'valueA' }
];

// Если хотите чтобы запросы выполнялись с разными значениями в параметрах
// const queryParams = [
//     { param1: 'value1', param2: 'valueA' },
//     { param1: 'value2', param2: 'valueB' },
//     { param1: 'value3', param2: 'valueC' },
// ];

// Функция записи результата теста
const logResponse = (requestNumber, status, responseBody, timeTaken) => {
    const logEntry = `Запрос ${requestNumber}\nСтатус: ${status}\nВремя ответа: ${timeTaken}ms\nТело ответа: ${JSON.stringify(responseBody)}\n\n`;
    fs.appendFileSync(resultsFilePath, logEntry);
};

// Функция отправки запроса
const sendRequest = async (params, requestNumber) => {
    const startTime = Date.now();
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: params
        });
        
        const timeTaken = Date.now() - startTime;
        if (logAllResponses) {
            logResponse(requestNumber, response.status, response.data, timeTaken);
        }
        
        completedRequests++;
    } catch (error) {
        const timeTaken = Date.now() - startTime;
        let status = error.response ? error.response.status : 'Неизвестная ошибка';
        let responseBody = error.response ? error.response.data : error.message;
        logResponse(requestNumber, status, responseBody, timeTaken);
    }
};

// Функция запуска теста
const startTest = () => {
    const interval = setInterval(() => {
        for (let i = 0; i < requestsPerSecond; i++) {
            if (completedRequests < totalRequests) {
                // Если есть параметры, используем их
                if (queryParams.length > 0) {
                    const params = queryParams[i % queryParams.length];
                    sendRequest(params, completedRequests + 1);
                } else {
                    sendRequest(null, completedRequests + 1);
                }
            }
        }

        if (completedRequests >= totalRequests) {
            clearInterval(interval);
            const summary = `Тест завершен. Отправлено ${completedRequests} запросов.\n`;
            fs.appendFileSync(resultsFilePath, summary);
            console.log(summary.trim());
        }
    }, 1000);
};

// Запуск теста
startTest();
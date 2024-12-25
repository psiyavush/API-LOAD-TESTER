# API LOAD TESTER - Тестировщик нагрузки API

## Описание

Этот проект представляет собой инструмент для тестирования нагрузки HTTP-запросов (GET и POST) к заданному API. Он использует Node.js и библиотеки `axios` и `dotenv` для отправки запросов и управления конфигурацией.

## Установка

1. Форкните, клонируйте или скачайте репозиторий:
   
   ```bash
   git clone https://github.com/psiyavush/API-LOAD-TESTER.git
   ```

2. Установите необходимые зависимости:

   ```bash
   npm install axios dotenv
   ```

3. Создайте файл `.env` в корневой директории проекта и добавьте следующие переменные окружения:

   ```plaintext
   BASE_URL=<ваш_URL_API>
   TOKEN=<ваш_токен_доступа>  # Опционально, если требуется авторизация
   ```
## Использование

### Тестирование GET-запросов

**Файл `testGet.js` с кодом для тестирования GET-запросов.**

Параметры теста, которые вы настраиваете исходя из своих потребностей

```javascript
const requestsPerSecond = 1; // Количество запросов в секунду
const durationInSeconds = 1; // Продолжительность теста в секундах
```

Флаг для записи результатов: true - все, false - только ошибки
```javascript
const logAllResponses = false;
```

Параметры GET-запроса
Если параметров нет:
```javascript
const queryParams = [];
```

Если хотите чтобы запросы выполнялись с одинаковыми значениями в параметрах:
```javascript
const queryParams = [
    { param1: 'value1', param2: 'valueA' }
];
```

Если хотите чтобы запросы выполнялись с разными значениями в параметрах
```javascript
const queryParams = [
     { param1: 'value1', param2: 'valueA' },
     { param1: 'value2', param2: 'valueB' },
    { param1: 'value3', param2: 'valueC' },
 ];
 ```

Запуск скрипт:

```bash
node testGet.js
```

### Тестирование POST-запросов

**Файл `testPost.js` с кодом для тестирования POST-запросов.**

Параметры теста, которые вы настраиваете исходя из своих потребностей

```javascript
const requestsPerSecond = 1; // Количество запросов в секунду
const durationInSeconds = 1; // Продолжительность теста в секундах
```

Редактирование заголовка запроса
```javascript
const response = await axios.post(url, data, {
    headers: {
        'Authorization': `Bearer ${token}`, // Токен авторизации
        'Content-Type': 'application/json' // Указываем тип контента
        // Здесь можно добавлять нужные заголовки
    }
});
```

Данные с возможностью динамического изменения в процессе теста
```javascript
const dataTemplate = {
    // если данные статичные, записывает как обычно:
    key1: 'value1', 
    key2: 'value2',
    // если данные динамичные, генерирует случайные значения, записывает так
    key3: () => 'value3'
    // где value3 например может быть Math.floor(Math.random() * 9) + 1
};
```

Запуск скрипт:

   ```bash
   node testPost.js
   ```

## Как это работает

- Скрипты отправляют заданное количество запросов в секунду на указанный API.
- Результаты запросов записываются в файлы `results.txt` или `post_results.txt` соответственно.

## Лицензия

Этот проект лицензирован под MIT License. См. файл [LICENSE](LICENSE) для подробностей.

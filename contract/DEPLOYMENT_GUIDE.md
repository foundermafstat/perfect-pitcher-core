# Perfect Pitcher Token - Руководство по развертыванию

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
```bash
cp env.example .env
```

Отредактируйте `.env` файл:
```env
# Ваш приватный ключ (НЕ КОММИТЬТЕ В ГИТ!)
PRIVATE_KEY=0x...

# Адреса для развертывания
TREASURY_ADDRESS=0x...
BACKEND_ADDRESS=0x...
API_SERVICE_ADDRESS=0x...

# Webhook для уведомлений
WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 3. Компиляция контрактов
```bash
npm run compile
```

### 4. Запуск тестов
```bash
npm test
```

### 5. Развертывание в testnet
```bash
npm run deploy:testnet
```

## 📋 Структура проекта

```
contract/
├── contracts/
│   ├── PerfectPitcherToken.sol      # Основной контракт
│   ├── interfaces/
│   │   ├── IDEXRouter.sol           # Интерфейс DEX
│   │   └── AggregatorV3Interface.sol # Интерфейс Chainlink
│   ├── libraries/
│   │   └── SafeMath32.sol           # Математические операции
│   └── mocks/                       # Mock контракты для тестов
├── scripts/
│   ├── deploy.js                    # Скрипт развертывания
│   └── monitor.js                   # Система мониторинга
├── test/
│   └── SimpleTest.js                # Базовые тесты
├── deployments/                     # Информация о развертываниях
├── logs/                           # Логи мониторинга
└── reports/                        # Отчеты системы
```

## 🔧 Основные команды

### Компиляция
```bash
npm run compile
```

### Тестирование
```bash
npm test                    # Все тесты
npm run test:coverage      # Покрытие тестами
```

### Развертывание
```bash
npm run deploy:testnet     # Core Testnet
npm run deploy:mainnet     # Core Mainnet
```

### Верификация
```bash
npx hardhat verify --network coreTestnet <CONTRACT_ADDRESS>
```

### Мониторинг
```bash
npm run monitor            # Запуск системы мониторинга
```

## 🌐 Сети

### Core Testnet
- **ChainID**: 1114
- **RPC**: https://rpc.test.btcs.network/
- **Explorer**: https://scan.test.btcs.network
- **Faucet**: https://scan.test.btcs.network/faucet

### Core Mainnet
- **ChainID**: 1116
- **RPC**: https://rpc.coredao.org
- **Explorer**: https://scan.coredao.org

## 📊 Мониторинг событий

После развертывания контракта обновите `TOKEN_ADDRESS` в `.env` и запустите мониторинг:

```bash
export TOKEN_ADDRESS=0x... # Адрес развернутого контракта
npm run monitor
```

Система будет отслеживать:
- 🔥 Траты токенов на AI-сервисы
- 🔒 Блокировки ресурсов для трансляций
- 💱 Обмены через встроенный DEX
- 🚨 Экстренные события

## 🔐 Безопасность

### Рекомендации перед mainnet:
1. **Аудит кода** - Проведите профессиональный аудит
2. **Тестирование** - Полное тестирование в testnet
3. **Мультисиг** - Используйте мультисиг для admin ролей
4. **Мониторинг** - Настройте алерты и мониторинг
5. **Резервное копирование** - Сохраните все ключи и конфигурации

### Роли и разрешения:
- **DEFAULT_ADMIN_ROLE**: Управление ролями, emergency функции
- **OPERATOR_ROLE**: Управление allowances, конфигурация
- **SERVICE_ROLE**: Списание токенов за AI-сервисы
- **PAUSER_ROLE**: Приостановка функций
- **UPGRADER_ROLE**: Авторизация обновлений

## 🚨 Устранение неполадок

### Ошибка: "Invalid private key"
Убедитесь что ваш `PRIVATE_KEY` в `.env` файле:
- Начинается с `0x`
- Содержит 64 символа после `0x`

### Ошибка: "Insufficient funds"
Пополните аккаунт тестовыми CORE токенами через faucet.

### Ошибка: "Contract already deployed"
Проверьте файлы в `deployments/` - возможно контракт уже развернут.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в `logs/`
2. Убедитесь что все зависимости установлены
3. Проверьте конфигурацию сети в `hardhat.config.js`
4. Обратитесь в техподдержку с полным описанием ошибки


# 🚀 Развертывание в Core Testnet

## 📋 Подготовка к развертыванию

### 1. Настройка приватного ключа

Создайте файл `.env` в корне проекта:

```bash
# Core Testnet Configuration
PRIVATE_KEY=0x<ваш_приватный_ключ_здесь>

# Опциональные параметры
TOKEN_ADDRESS=
TREASURY_ADDRESS=
MOCK_ROUTER=
CORE_PRICE_FEED=
USDT_PRICE_FEED=
```

**⚠️ ВАЖНО:** 
- Никогда не коммитьте `.env` файл в git!
- Используйте отдельный кошелек для тестнета
- Убедитесь, что приватный ключ начинается с `0x` и содержит 64 символа

### 2. Получение тестовых CORE токенов

1. Перейдите на [Core Testnet Bridge](https://bridge.coredao.org/testnet)
2. Подключите ваш кошелек 
3. Получите тестовые CORE токены (минимум 0.1 CORE)
4. Убедитесь, что ваш кошелек подключен к Core Testnet:
   - **Network Name:** Core Testnet
   - **RPC URL:** `https://rpc.test.btcs.network/`
   - **Chain ID:** `1114`
   - **Currency Symbol:** `CORE`
   - **Explorer:** `https://scan.test.btcs.network`

### 3. Проверка настроек

Проверьте ваш баланс:

```bash
npx hardhat run scripts/check-balance.js --network coreTestnet
```

## 🚀 Развертывание

### Автоматическое развертывание

```bash
npx hardhat run scripts/deploy-real-testnet.js --network coreTestnet
```

### Ручная проверка перед развертыванием

```bash
# Проверка компиляции
npm run compile

# Проверка тестов (опционально)
npm run test

# Проверка сети
npx hardhat console --network coreTestnet
```

## 📊 Что происходит при развертывании

1. **Проверка баланса** - Убеждаемся, что у вас достаточно CORE
2. **Развертывание Mock контрактов** - Price feeds и DEX router для тестирования
3. **Развертывание основного контракта** - Perfect Pitcher Token через UUPS proxy
4. **Настройка ролей** - Предоставление необходимых разрешений
5. **Верификация** - Проверка корректности развертывания
6. **Сохранение информации** - Запись адресов в файл deployments/

## 📄 Результаты развертывания

После успешного развертывания вы получите:

- **Адрес токена** - Основной адрес для взаимодействия
- **Explorer ссылку** - Для просмотра в blockchain explorer
- **Deployment файл** - JSON с полной информацией о развертывании
- **Инструкции** - Следующие шаги для работы с контрактом

## 🔍 Верификация контракта

После развертывания рекомендуется верифицировать контракт:

```bash
npx hardhat verify --network coreTestnet <PROXY_ADDRESS>
```

## 🧪 Тестирование развернутого контракта

```bash
# Базовые тесты
npx hardhat run scripts/contract-stats.js --network coreTestnet

# Интерактивное взаимодействие
npx hardhat run scripts/interact-with-contract.js --network coreTestnet

# Мониторинг событий
npx hardhat run scripts/monitor-contract.js --network coreTestnet
```

## ❌ Устранение проблем

### Ошибка "insufficient funds"
- Проверьте баланс CORE в кошельке
- Получите больше тестовых токенов с крана

### Ошибка "network"
- Проверьте интернет соединение
- Убедитесь, что RPC URL доступен
- Попробуйте альтернативный RPC: `https://rpc.test.btcs.network/`

### Ошибка "nonce too high"
- Сбросьте nonce в вашем кошельке
- Или подождите несколько минут и попробуйте снова

### Ошибка "gas estimation failed"
- Увеличьте gas limit в hardhat.config.js
- Проверьте, что все контракты компилируются без ошибок

## 🔗 Полезные ссылки

- [Core Testnet Explorer](https://scan.test.btcs.network)
- [Core Testnet Bridge](https://bridge.coredao.org/testnet)
- [Core Documentation](https://docs.coredao.org/)
- [MetaMask Setup Guide](https://docs.coredao.org/docs/Dev-Guide/core-testnet-wallet-config)

## 📞 Поддержка

При возникновении проблем:

1. Проверьте раздел "Устранение проблем" выше
2. Убедитесь, что все зависимости установлены: `npm install`
3. Проверьте, что используете правильную сеть: `--network coreTestnet`
4. Проверьте актуальность RPC URL и других настроек сети

---

**🎯 Готово к развертыванию!** Следуйте инструкциям выше для успешного деплоя в Core Testnet.


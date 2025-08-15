# 🚀 Готово к развертыванию в Core Testnet

## ✅ Все настроено и готово!

Ваш проект Perfect Pitcher Token полностью подготовлен для развертывания в реальный Core Testnet.

## 📋 Контрольный список перед развертыванием

### 1. Настройка кошелька и приватного ключа

**Создайте файл `.env` в корне проекта:**

```env
# ВАЖНО: Замените на ваш реальный приватный ключ
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Эти значения будут автоматически заполнены после развертывания
TOKEN_ADDRESS=
TREASURY_ADDRESS=
MOCK_ROUTER=
CORE_PRICE_FEED=
USDT_PRICE_FEED=
```

**⚠️ БЕЗОПАСНОСТЬ:**
- Используйте отдельный кошелек только для тестнета
- Никогда не коммитьте .env в git
- Приватный ключ должен содержать ровно 66 символов (включая 0x)

### 2. Получение тестовых CORE токенов

1. **Перейдите на кран:** https://bridge.coredao.org/testnet
2. **Подключите ваш кошелек**
3. **Получите минимум 0.5 CORE** (рекомендуется 1 CORE)

### 3. Настройка MetaMask для Core Testnet

```json
Network Name: Core Testnet
RPC URL: https://rpc.test.btcs.network/
Chain ID: 1114
Currency Symbol: CORE
Block Explorer: https://scan.test.btcs.network
```

## 🚀 Процесс развертывания

### Шаг 1: Проверка готовности

```bash
npm run check:balance
```

Этот скрипт проверит:
- ✅ Формат приватного ключа
- ✅ Баланс CORE токенов
- ✅ Подключение к сети
- ✅ Оценку стоимости газа

### Шаг 2: Компиляция контрактов

```bash
npm run compile
```

### Шаг 3: Развертывание

```bash
npm run deploy:testnet
```

**Этот скрипт выполнит:**
1. 🔍 Проверку настроек и баланса
2. 📊 Развертывание Mock Price Feeds (CORE/USD, USDT/USD)  
3. 🔄 Развертывание Mock DEX Router
4. 🎯 Развертывание Perfect Pitcher Token (UUPS Proxy)
5. 🔐 Настройку ролей и разрешений
6. ✅ Верификацию развертывания
7. 📄 Сохранение информации в файл deployments/

## 📊 Что вы получите после развертывания

```json
{
  "tokenProxy": "0x...",           // Основной адрес токена
  "implementation": "0x...",        // Адрес реализации
  "treasury": "0x...",             // Адрес treasury
  "explorer": "https://scan.test.btcs.network/address/0x...",
  "envVariables": {
    "TOKEN_ADDRESS": "0x...",      // Добавьте в .env
    "TREASURY_ADDRESS": "0x...",
    "MOCK_ROUTER": "0x...",
    "CORE_PRICE_FEED": "0x...",
    "USDT_PRICE_FEED": "0x..."
  }
}
```

## 🧪 Тестирование развернутого контракта

После успешного развертывания:

### Просмотр статистики
```bash
npm run stats
```

### Интерактивное взаимодействие
```bash
npm run interact
```

### Мониторинг событий в реальном времени
```bash
npm run monitor
```

### Верификация в explorer
```bash
npm run verify <TOKEN_ADDRESS>
```

## 📱 Функции контракта для тестирования

✅ **ERC20 Operations**: Transfer, Approve, Balance  
✅ **SaaS Spending**: spendOnService() для AI-сервисов  
✅ **Resource Locking**: lockResourcesForBroadcast() для трансляций  
✅ **Emergency Unlock**: emergencyUnlock() с комиссией 5%  
✅ **Role Management**: Управление ролями (Admin, Operator, Service)  
✅ **Pausable Functions**: Селективная пауза функций  
✅ **Batch Operations**: Массовые операции для эффективности  
✅ **UUPS Upgrades**: Обновление контракта через proxy  

## 💡 Примеры использования

### Перевод токенов
```javascript
await token.transfer("0x...", ethers.parseEther("100"));
```

### Трата на AI-сервис
```javascript
const serviceId = ethers.keccak256(ethers.toUtf8Bytes("gpt4_generation"));
await token.spendOnService(userAddress, ethers.parseEther("50"), serviceId);
```

### Блокировка для трансляции
```javascript
const broadcastId = ethers.keccak256(ethers.toUtf8Bytes("live_stream_001"));
await token.lockResourcesForBroadcast(
    ethers.parseEther("200"), 
    3600,  // 1 час
    broadcastId
);
```

## 🔗 Полезные ссылки

- **Explorer**: https://scan.test.btcs.network
- **Кран токенов**: https://bridge.coredao.org/testnet  
- **Документация Core**: https://docs.coredao.org/
- **MetaMask Setup**: https://docs.coredao.org/docs/Dev-Guide/core-testnet-wallet-config

## 📞 Поддержка и устранение проблем

### Частые ошибки:

**"insufficient funds"**
→ Получите больше CORE с крана

**"network"**  
→ Проверьте RPC URL и интернет

**"nonce too high"**
→ Сбросьте MetaMask или подождите

**"private key"**
→ Проверьте формат в .env файле

---

## 🎯 ВСЁ ГОТОВО!

Выполните команды в указанном порядке:

```bash
# 1. Проверка
npm run check:balance

# 2. Компиляция  
npm run compile

# 3. Развертывание
npm run deploy:testnet

# 4. Тестирование
npm run stats
npm run interact
```

**🚀 Удачного развертывания в Core Testnet!**

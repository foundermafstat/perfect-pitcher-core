# 🎯 Финальная настройка для развертывания

## ✅ Настройки сети подтверждены

**Core Testnet настроен корректно:**
- ✅ RPC URL: `https://rpc.test.btcs.network/`
- ✅ Chain ID: `1115` (реальный ID сети)
- ✅ Explorer: `https://scan.test.btcs.network`

## 🔑 Последний шаг: Настройка приватного ключа

### Создайте файл `.env` с вашим реальным приватным ключом:

```env
# Замените на ваш реальный приватный ключ (66 символов, включая 0x)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**⚠️ ВАЖНО:**
- Приватный ключ должен содержать ровно **66 символов** (включая `0x`)
- Используйте **отдельный кошелек только для тестнета**
- **Никогда не коммитьте .env в git**

### Пример корректного приватного ключа:
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
  ^^                                                            ^^
  |                           64 символа                         |
  +- 0x (2 символа) --------------------------------------------- +
  = Всего 66 символов
```

## 💰 Получение тестовых CORE токенов

1. **Перейдите на:** https://bridge.coredao.org/testnet
2. **Подключите ваш кошелек** (тот же, что и в PRIVATE_KEY)
3. **Получите минимум 0.5 CORE** для развертывания

## 🚀 Готово к развертыванию!

После настройки .env файла выполните:

```bash
# 1. Проверка готовности
npm run check:balance

# 2. Развертывание
npm run deploy:testnet
```

## 🔧 Настройки MetaMask

Если используете MetaMask, добавьте сеть:

```
Network Name: Core Testnet
RPC URL: https://rpc.test.btcs.network/
Chain ID: 1115
Currency Symbol: CORE
Block Explorer: https://scan.test.btcs.network
```

## 📱 Альтернативные команды

```bash
# Развертывание с альтернативным Chain ID 1114 (если нужно)
npx hardhat run scripts/deploy-real-testnet.js --network coreTestnet1114

# Проверка баланса
npm run check:balance

# Статистика после развертывания
npm run stats

# Интерактивное взаимодействие
npm run interact

# Мониторинг в реальном времени
npm run monitor
```

---

## 🎉 Все готово!

Осталось только:
1. ✅ Добавить реальный PRIVATE_KEY в .env
2. ✅ Получить тестовые CORE токены
3. 🚀 Запустить `npm run deploy:testnet`


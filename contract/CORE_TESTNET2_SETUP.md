# 🚀 Настройка для Core Testnet2

## ✅ Обновленные параметры Core Testnet2

**Все настройки обновлены для Core Testnet2:**

- **RPC URL:** `https://rpc.test2.btcs.network`
- **Chain ID:** `1114` (Hex: `0x45a`)
- **Currency Symbol:** `TCORE2`
- **Block Explorer:** `https://scan.test2.btcs.network`
- **Faucet:** `https://scan.test2.btcs.network/faucet`
- **Staking Website:** `https://stake.test2.btcs.network`

## 🔧 Настройка MetaMask для Core Testnet2

```json
{
  "Network Name": "Core Testnet2",
  "RPC URL": "https://rpc.test2.btcs.network",
  "Chain ID": "1114",
  "Currency Symbol": "TCORE2",
  "Block Explorer": "https://scan.test2.btcs.network"
}
```

## 💰 Получение тестовых токенов

**Новый кран для Core Testnet2:**
🔗 https://scan.test2.btcs.network/faucet

1. Перейдите на кран
2. Подключите ваш кошелек
3. Получите тестовые TCORE2 токены
4. Минимум нужно **0.5 TCORE2** для развертывания

## 🔑 Настройка приватного ключа

Создайте файл `.env`:

```env
# Ваш приватный ключ (66 символов, включая 0x)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Эти поля заполнятся автоматически после развертывания
TOKEN_ADDRESS=
TREASURY_ADDRESS=
MOCK_ROUTER=
CORE_PRICE_FEED=
USDT_PRICE_FEED=
```

## 🚀 Команды для развертывания

```bash
# 1. Проверка баланса и настроек
npm run check:balance

# 2. Развертывание в Core Testnet2
npm run deploy:testnet

# 3. Статистика развернутого контракта
npm run stats

# 4. Интерактивное взаимодействие
npm run interact

# 5. Мониторинг событий в реальном времени
npm run monitor
```

## 🔍 Проверка развертывания

После успешного развертывания:

1. **Explorer:** Проверьте контракт на `https://scan.test2.btcs.network`
2. **Токены:** Символ будет **PRFCT** (Perfect Pitcher Token)
3. **Supply:** 1,000,000,000 PRFCT
4. **Функции:** Все SaaS функции готовы к использованию

## 📊 Функционал контракта

✅ **ERC20 Токен** с upgradeable архитектурой  
✅ **SaaS траты** - spendOnService() для AI-сервисов  
✅ **Блокировка ресурсов** - для live трансляций  
✅ **Emergency unlock** - с комиссией 5%  
✅ **Role management** - Admin, Operator, Service роли  
✅ **Selective pause** - блокировка отдельных функций  
✅ **Batch operations** - эффективные массовые операции  
✅ **UUPS Proxy** - возможность обновления контракта  

## 💡 Примеры использования

### Перевод токенов
```javascript
await token.transfer("0xRecipient", ethers.parseEther("100"));
```

### Трата на AI-сервис
```javascript
const serviceId = ethers.keccak256(ethers.toUtf8Bytes("gpt4_generation"));
await token.spendOnService(userAddress, ethers.parseEther("50"), serviceId);
```

### Блокировка для трансляции
```javascript
const streamId = ethers.keccak256(ethers.toUtf8Bytes("live_stream_001"));
await token.lockResourcesForBroadcast(
    ethers.parseEther("200"),  // сумма
    3600,                      // 1 час
    streamId
);
```

## 🔗 Полезные ссылки

- **🌐 Explorer:** https://scan.test2.btcs.network
- **💧 Faucet:** https://scan.test2.btcs.network/faucet
- **🥩 Staking:** https://stake.test2.btcs.network
- **📖 Core Docs:** https://docs.coredao.org/

## ⚠️ Важные заметки

1. **Используйте TCORE2** токены для газа (не CORE)
2. **Chain ID 1114** обязателен для всех транзакций
3. **Новый RPC URL** - `https://rpc.test2.btcs.network`
4. **Все старые адреса** с Core Testnet1 не работают

---

## 🎯 Готово к развертыванию!

1. ✅ Настройте `.env` с приватным ключом
2. ✅ Получите TCORE2 токены с крана
3. 🚀 Выполните `npm run deploy:testnet`

**Perfect Pitcher Token готов к запуску в Core Testnet2!** 🎉


// scripts/simple-stats.js - Упрощенная статистика контракта
const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A";

async function main() {
    console.log("📊 Статистика Perfect Pitcher Token");
    console.log("═".repeat(50));
    
    try {
        const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
        const [deployer] = await ethers.getSigners();
        
        // Базовая информация
        console.log("📍 Адрес контракта:", CONTRACT_ADDRESS);
        console.log("👤 Кошелек:", deployer.address);
        console.log("🕒 Время:", new Date().toLocaleString());
        
        // Информация о токене
        console.log("\n💰 ТОКЕН:");
        const name = await token.name();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const totalSupply = await token.totalSupply();
        
        console.log(`📛 Название: ${name}`);
        console.log(`🔤 Символ: ${symbol}`);
        console.log(`🔢 Десятичные: ${decimals}`);
        console.log(`💰 Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
        
        // Баланс деплойера
        const deployerBalance = await token.balanceOf(deployer.address);
        console.log(`🏦 Баланс деплойера: ${ethers.formatEther(deployerBalance)} ${symbol}`);
        
        // Баланс контракта
        const contractBalance = await token.balanceOf(CONTRACT_ADDRESS);
        console.log(`📦 Баланс контракта: ${ethers.formatEther(contractBalance)} ${symbol}`);
        
        // Проверка ролей
        console.log("\n🔐 РОЛИ:");
        try {
            const adminRole = await token.DEFAULT_ADMIN_ROLE();
            const operatorRole = await token.OPERATOR_ROLE();
            const serviceRole = await token.SERVICE_ROLE();
            
            const hasAdmin = await token.hasRole(adminRole, deployer.address);
            const hasOperator = await token.hasRole(operatorRole, deployer.address);
            const hasService = await token.hasRole(serviceRole, deployer.address);
            
            console.log(`👑 ADMIN_ROLE: ${hasAdmin ? "✅" : "❌"}`);
            console.log(`⚙️  OPERATOR_ROLE: ${hasOperator ? "✅" : "❌"}`);
            console.log(`🔧 SERVICE_ROLE: ${hasService ? "✅" : "❌"}`);
        } catch (error) {
            console.log("⚠️  Ошибка проверки ролей:", error.message);
        }
        
        // Конфигурация
        console.log("\n⚙️  КОНФИГУРАЦИЯ:");
        try {
            const config = await token.config();
            console.log(`💸 Максимальная трата: ${ethers.formatEther(config.maxSpendingAmount)} ${symbol}`);
            console.log(`⏰ Максимальная блокировка: ${config.maxLockDuration} сек (${Math.floor(config.maxLockDuration / 86400)} дней)`);
            console.log(`🚨 Emergency комиссия: ${Number(config.emergencyUnlockFee) / 100}%`);
        } catch (error) {
            console.log("⚠️  Ошибка получения конфигурации:", error.message);
        }
        
        // Состояние контракта
        console.log("\n📊 СОСТОЯНИЕ:");
        try {
            const isPaused = await token.paused();
            console.log(`⏸️  Пауза: ${isPaused ? "Включена" : "Выключена"}`);
        } catch (error) {
            console.log("⚠️  Ошибка проверки паузы:", error.message);
        }
        
        // Информация о сети
        console.log("\n🌐 СЕТЬ:");
        const blockNumber = await ethers.provider.getBlockNumber();
        const network = await ethers.provider.getNetwork();
        
        console.log(`📦 Текущий блок: ${blockNumber}`);
        console.log(`🔗 Chain ID: ${network.chainId}`);
        console.log(`🌍 Network: ${network.name || "Unknown"}`);
        
        // Ссылки
        console.log("\n🔗 ССЫЛКИ:");
        console.log(`🌐 Explorer: https://scan.test2.btcs.network/address/${CONTRACT_ADDRESS}`);
        console.log(`💧 Faucet: https://scan.test2.btcs.network/faucet`);
        
        // Тестовые функции
        console.log("\n🧪 ДОСТУПНЫЕ ФУНКЦИИ:");
        console.log("1. 💸 transfer() - Перевод токенов");
        console.log("2. 🔥 burn() - Сжигание токенов");
        console.log("3. 💳 setSpendingAllowance() - Установка лимита трат");
        console.log("4. 🤖 spendOnService() - Трата на AI-сервисы");
        console.log("5. 🔒 lockResourcesForBroadcast() - Блокировка для трансляций");
        console.log("6. 🚨 emergencyUnlock() - Экстренная разблокировка");
        
        console.log("\n✅ Анализ завершен!");
        console.log("💡 Для интерактивного взаимодействия: npm run interact");
        console.log("📡 Для мониторинга событий: npm run monitor");
        
    } catch (error) {
        console.error("❌ Ошибка анализа:", error.message);
        throw error;
    }
}

// Запуск при прямом вызове
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Критическая ошибка:", error);
            process.exit(1);
        });
}

module.exports = { main };


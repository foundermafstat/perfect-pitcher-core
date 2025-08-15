// scripts/contract-stats.js - Детальная статистика и аналитика контракта
const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A";

async function main() {
    console.log("📊 Анализ статистики Perfect Pitcher Token");
    console.log("═".repeat(60));
    
    try {
        const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
        const [admin] = await ethers.getSigners();
        
        console.log("📍 Адрес контракта:", CONTRACT_ADDRESS);
        console.log("👤 Анализирует:", admin.address);
        console.log("🕒 Время анализа:", new Date().toLocaleString());
        
        // Базовая информация
        await showBasicInfo(token);
        
        // Статистика токенов
        await showTokenStats(token);
        
        // Статистика ролей
        await showRoleStats(token, admin);
        
        // Конфигурация
        await showConfiguration(token);
        
        // Анализ событий
        await analyzeEvents(token);
        
        // Статистика блокировок
        await showLockStats(token, admin);
        
        console.log("\n✅ Анализ завершен!");
        
    } catch (error) {
        console.error("❌ Ошибка анализа:", error.message);
        throw error;
    }
}

async function showBasicInfo(token) {
    console.log("\n📋 БАЗОВАЯ ИНФОРМАЦИЯ");
    console.log("─".repeat(40));
    
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    const contractBalance = await token.balanceOf(await token.getAddress());
    
    console.log(`📛 Название: ${name}`);
    console.log(`🔤 Символ: ${symbol}`);
    console.log(`🔢 Десятичные: ${decimals}`);
    console.log(`💰 Общий supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`🏦 Баланс контракта: ${ethers.formatEther(contractBalance)} ${symbol}`);
    
    // Проверяем, является ли контракт upgradeable
    try {
        const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implementation = await ethers.provider.getStorage(await token.getAddress(), implementationSlot);
        if (implementation !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
            console.log(`🔧 Implementation: ${ethers.getAddress("0x" + implementation.slice(-40))}`);
            console.log("✅ Контракт поддерживает обновления (UUPS)");
        }
    } catch (e) {
        console.log("ℹ️  Информация об implementation недоступна");
    }
}

async function showTokenStats(token) {
    console.log("\n💹 СТАТИСТИКА ТОКЕНОВ");
    console.log("─".repeat(40));
    
    const signers = await ethers.getSigners();
    const admin = signers[0];
    const accounts = [admin.address];
    
    let totalDistributed = 0n;
    let nonZeroBalances = 0;
    
    for (let i = 0; i < accounts.length; i++) {
        const balance = await token.balanceOf(accounts[i]);
        const allowance = await token.spendingAllowances(accounts[i]);
        
        if (balance > 0n || allowance > 0n) {
            console.log(`\n👤 Account ${i + 1}: ${accounts[i]}`);
            console.log(`  💰 Баланс: ${ethers.formatEther(balance)} PRFCT`);
            console.log(`  💳 Allowance: ${ethers.formatEther(allowance)} PRFCT`);
            
            if (balance > 0n) {
                totalDistributed += balance;
                nonZeroBalances++;
            }
        }
    }
    
    console.log(`\n📊 Суммарная статистика:`);
    console.log(`  🏦 Распределено: ${ethers.formatEther(totalDistributed)} PRFCT`);
    console.log(`  👥 Аккаунтов с балансом: ${nonZeroBalances}`);
}

async function showRoleStats(token, admin) {
    console.log("\n🔐 СТАТИСТИКА РОЛЕЙ");
    console.log("─".repeat(40));
    
    const roles = [
        { name: "DEFAULT_ADMIN_ROLE", hash: await token.DEFAULT_ADMIN_ROLE() },
        { name: "OPERATOR_ROLE", hash: await token.OPERATOR_ROLE() },
        { name: "SERVICE_ROLE", hash: await token.SERVICE_ROLE() },
        { name: "PAUSER_ROLE", hash: await token.PAUSER_ROLE() },
        { name: "UPGRADER_ROLE", hash: await token.UPGRADER_ROLE() }
    ];
    
    for (const role of roles) {
        const hasRole = await token.hasRole(role.hash, admin.address);
        const memberCount = await token.getRoleMemberCount(role.hash);
        
        console.log(`\n🏷️  ${role.name}:`);
        console.log(`  ✅ Админ имеет роль: ${hasRole ? "Да" : "Нет"}`);
        console.log(`  👥 Всего участников: ${memberCount}`);
        
        // Показываем всех участников роли
        for (let i = 0; i < memberCount; i++) {
            const member = await token.getRoleMember(role.hash, i);
            console.log(`    ${i + 1}. ${member}`);
        }
    }
}

async function showConfiguration(token) {
    console.log("\n⚙️  КОНФИГУРАЦИЯ КОНТРАКТА");
    console.log("─".repeat(40));
    
    try {
        const config = await token.config();
        
        console.log(`💸 Максимальная трата: ${ethers.formatEther(config.maxSpendingAmount)} PRFCT`);
        console.log(`⏱️  Максимальная блокировка: ${config.maxLockDuration} секунд (${Math.floor(config.maxLockDuration / 86400)} дней)`);
        console.log(`🚨 Комиссия emergency unlock: ${Number(config.emergencyUnlockFee) / 100}%`);
        
        const isPaused = await token.paused();
        console.log(`⏸️  Статус паузы: ${isPaused ? "Приостановлен" : "Активен"}`);
        
    } catch (error) {
        console.log("⚠️  Не удалось получить конфигурацию:", error.message);
    }
}

async function analyzeEvents(token) {
    console.log("\n📈 АНАЛИЗ СОБЫТИЙ");
    console.log("─".repeat(40));
    
    try {
        const currentBlock = await ethers.provider.getBlockNumber();
        const startBlock = Math.max(0, currentBlock - 1000); // Последние 1000 блоков
        
        console.log(`🔍 Анализ блоков ${startBlock} - ${currentBlock}`);
        
        // Анализируем Transfer события
        const transferFilter = token.filters.Transfer();
        const transfers = await token.queryFilter(transferFilter, startBlock);
        
        // Анализируем ServiceUsed события
        const serviceFilter = token.filters.ServiceUsed();
        const services = await token.queryFilter(serviceFilter, startBlock);
        
        // Анализируем ResourcesLocked события
        const lockFilter = token.filters.ResourcesLocked();
        const locks = await token.queryFilter(lockFilter, startBlock);
        
        console.log(`\n📊 События за период:`);
        console.log(`  💸 Transfers: ${transfers.length}`);
        console.log(`  🤖 Service используется: ${services.length}`);
        console.log(`  🔒 Блокировки ресурсов: ${locks.length}`);
        
        // Анализ трансферов
        if (transfers.length > 0) {
            let totalTransferred = 0n;
            const uniqueReceivers = new Set();
            
            transfers.forEach(transfer => {
                totalTransferred += transfer.args.value;
                uniqueReceivers.add(transfer.args.to);
            });
            
            console.log(`\n💸 Статистика трансферов:`);
            console.log(`  📈 Общий объем: ${ethers.formatEther(totalTransferred)} PRFCT`);
            console.log(`  📈 Средний размер: ${ethers.formatEther(totalTransferred / BigInt(transfers.length))} PRFCT`);
            console.log(`  👥 Уникальных получателей: ${uniqueReceivers.size}`);
        }
        
        // Анализ использования сервисов
        if (services.length > 0) {
            let totalSpent = 0n;
            const uniqueServices = new Set();
            
            services.forEach(service => {
                totalSpent += service.args.amount;
                uniqueServices.add(service.args.serviceId);
            });
            
            console.log(`\n🤖 Статистика сервисов:`);
            console.log(`  💰 Общие траты: ${ethers.formatEther(totalSpent)} PRFCT`);
            console.log(`  📈 Средняя трата: ${ethers.formatEther(totalSpent / BigInt(services.length))} PRFCT`);
            console.log(`  🔧 Уникальных сервисов: ${uniqueServices.size}`);
        }
        
    } catch (error) {
        console.log("⚠️  Ошибка анализа событий:", error.message);
    }
}

async function showLockStats(token, admin) {
    console.log("\n🔒 СТАТИСТИКА БЛОКИРОВОК");
    console.log("─".repeat(40));
    
    try {
        // Генерируем несколько тестовых lockId для проверки
        const testLockIds = [
            ethers.keccak256(ethers.toUtf8Bytes("test_lock_1")),
            ethers.keccak256(ethers.toUtf8Bytes("test_lock_2")),
            ethers.keccak256(ethers.toUtf8Bytes("live_broadcast")),
        ];
        
        let activeLocks = 0;
        let totalLocked = 0n;
        
        for (const lockId of testLockIds) {
            try {
                const lockInfo = await token.getLockInfo(admin.address, lockId);
                if (lockInfo.isActive) {
                    activeLocks++;
                    totalLocked += lockInfo.amount;
                    
                    console.log(`\n🔑 Lock ID: ${lockId.slice(0, 10)}...`);
                    console.log(`  💰 Сумма: ${ethers.formatEther(lockInfo.amount)} PRFCT`);
                    console.log(`  ⏰ Разблокировка: ${new Date(Number(lockInfo.unlockTime) * 1000).toLocaleString()}`);
                    console.log(`  ✅ Активна: ${lockInfo.isActive}`);
                }
            } catch (e) {
                // Блокировка не существует или неактивна
            }
        }
        
        console.log(`\n📊 Суммарная статистика блокировок:`);
        console.log(`  🔢 Активных блокировок: ${activeLocks}`);
        console.log(`  💰 Общая заблокированная сумма: ${ethers.formatEther(totalLocked)} PRFCT`);
        
    } catch (error) {
        console.log("⚠️  Ошибка анализа блокировок:", error.message);
    }
}

// Утилитарные функции для быстрого анализа
async function quickStats() {
    const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
    const supply = await token.totalSupply();
    const [admin] = await ethers.getSigners();
    const balance = await token.balanceOf(admin.address);
    
    console.log(`📊 Быстрая статистика:`);
    console.log(`  💰 Supply: ${ethers.formatEther(supply)} PRFCT`);
    console.log(`  🏦 Баланс админа: ${ethers.formatEther(balance)} PRFCT`);
    console.log(`  📍 Контракт: ${CONTRACT_ADDRESS}`);
}

async function checkHealth() {
    console.log("🔍 Проверка состояния контракта...");
    
    try {
        const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
        
        // Базовые проверки
        const name = await token.name();
        const symbol = await token.symbol();
        const totalSupply = await token.totalSupply();
        const isPaused = await token.paused();
        
        console.log("✅ Контракт отвечает на запросы");
        console.log(`✅ Название: ${name}`);
        console.log(`✅ Символ: ${symbol}`);
        console.log(`✅ Supply: ${ethers.formatEther(totalSupply)} PRFCT`);
        console.log(`${isPaused ? "⚠️" : "✅"} Статус: ${isPaused ? "Приостановлен" : "Активен"}`);
        
        return true;
    } catch (error) {
        console.error("❌ Ошибка подключения:", error.message);
        return false;
    }
}

module.exports = {
    CONTRACT_ADDRESS,
    quickStats,
    checkHealth,
    main
};

// Запуск при прямом вызове
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Критическая ошибка:", error);
            process.exit(1);
        });
}

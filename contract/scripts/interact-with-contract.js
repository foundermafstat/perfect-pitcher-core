// scripts/interact-with-contract.js - Скрипт для взаимодействия с развернутым контрактом
const { ethers } = require("hardhat");

// Адрес развернутого контракта в Core Testnet2
const CONTRACT_ADDRESS = "0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A";

async function main() {
    console.log("🔗 Подключение к Perfect Pitcher Token...");
    console.log("📍 Адрес контракта:", CONTRACT_ADDRESS);
    
    try {
        // Подключаемся к контракту
        const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
        const signers = await ethers.getSigners();
        const admin = signers[0];
        
        console.log("👤 Админ:", admin.address);
        console.log("👤 Всего signers:", signers.length);
        
        // Проверяем базовую информацию
        console.log("\n📊 Базовая информация о контракте:");
        console.log("- Название:", await token.name());
        console.log("- Символ:", await token.symbol());
        console.log("- Общий supply:", ethers.formatEther(await token.totalSupply()), "PRFCT");
        console.log("- Баланс админа:", ethers.formatEther(await token.balanceOf(admin.address)), "PRFCT");
        
        // Проверяем роли
        console.log("\n🔐 Проверка ролей:");
        const adminRole = await token.DEFAULT_ADMIN_ROLE();
        const operatorRole = await token.OPERATOR_ROLE();
        const serviceRole = await token.SERVICE_ROLE();
        
        console.log("- Админ имеет ADMIN_ROLE:", await token.hasRole(adminRole, admin.address));
        console.log("- Админ имеет OPERATOR_ROLE:", await token.hasRole(operatorRole, admin.address));
        console.log("- Админ имеет SERVICE_ROLE:", await token.hasRole(serviceRole, admin.address));
        
        // Интерактивное меню
        console.log("\n🎮 Доступные операции:");
        console.log("1. Перевести токены пользователю");
        console.log("2. Установить spending allowance");
        console.log("3. Потратить токены на AI-сервис");
        console.log("4. Заблокировать ресурсы для трансляции");
        console.log("5. Просмотреть информацию о блокировках");
        console.log("6. Сжечь токены");
        console.log("7. Обновить конфигурацию");
        console.log("8. Показать статистику");
        
        // Демонстрационный пример использования
        await demonstrateFeatures(token, admin);
        
    } catch (error) {
        console.error("❌ Ошибка подключения к контракту:", error.message);
        throw error;
    }
}

async function demonstrateFeatures(token, admin) {
    console.log("\n🎯 Демонстрация основных функций:");
    
    try {
        // 1. Перевод токенов (самому себе для демонстрации)
        console.log("\n1️⃣ Демонстрация перевода токенов...");
        const transferAmount = ethers.parseEther("1000");
        const balanceBeforeTransfer = await token.balanceOf(admin.address);
        console.log(`📊 Текущий баланс: ${ethers.formatEther(balanceBeforeTransfer)} PRFCT`);
        
        // 2. Установка spending allowance для себя
        console.log("\n2️⃣ Установка spending allowance...");
        const allowanceAmount = ethers.parseEther("500");
        await token.setSpendingAllowance(admin.address, allowanceAmount);
        const currentAllowance = await token.spendingAllowances(admin.address);
        console.log(`✅ Установлен allowance ${ethers.formatEther(currentAllowance)} PRFCT для ${admin.address}`);
        
        // 3. Трата на AI-сервис
        console.log("\n3️⃣ Трата на AI-сервис...");
        const serviceId = ethers.keccak256(ethers.toUtf8Bytes("gpt4_generation"));
        const spendAmount = ethers.parseEther("25");
        
        const balanceBefore = await token.balanceOf(admin.address);
        await token.spendOnService(admin.address, spendAmount, serviceId);
        const balanceAfter = await token.balanceOf(admin.address);
        
        console.log(`✅ Потрачено ${ethers.formatEther(spendAmount)} PRFCT на AI-сервис`);
        console.log(`📊 Баланс: ${ethers.formatEther(balanceBefore)} → ${ethers.formatEther(balanceAfter)} PRFCT`);
        
        // 4. Блокировка ресурсов
        console.log("\n4️⃣ Блокировка ресурсов...");
        const lockAmount = ethers.parseEther("100");
        const lockDuration = 1800; // 30 минут
        const broadcastId = ethers.keccak256(ethers.toUtf8Bytes("live_stream_001"));
        
        const tx = await token.lockResourcesForBroadcast(lockAmount, lockDuration, broadcastId);
        const receipt = await tx.wait();
        
        // Получаем lockId из события
        let lockId;
        for (const log of receipt.logs) {
            try {
                const parsed = token.interface.parseLog(log);
                if (parsed.name === "ResourcesLocked") {
                    lockId = parsed.args.lockId;
                    break;
                }
            } catch (e) {}
        }
        
        if (lockId) {
            console.log(`✅ Заблокировано ${ethers.formatEther(lockAmount)} PRFCT`);
            console.log(`🔑 Lock ID: ${lockId}`);
            
            // Информация о блокировке
            const lockInfo = await token.getLockInfo(admin.address, lockId);
            console.log(`📋 Время разблокировки: ${new Date(Number(lockInfo.unlockTime) * 1000).toLocaleString()}`);
        }
        
        // 5. Статистика
        console.log("\n📊 Текущая статистика:");
        const finalBalance = await token.balanceOf(admin.address);
        const totalSupply = await token.totalSupply();
        const contractBalance = await token.balanceOf(await token.getAddress());
        
        console.log(`- Баланс админа: ${ethers.formatEther(finalBalance)} PRFCT`);
        console.log(`- Общий supply: ${ethers.formatEther(totalSupply)} PRFCT`);
        console.log(`- Баланс контракта: ${ethers.formatEther(contractBalance)} PRFCT`);
        
        console.log("\n🎉 Демонстрация завершена успешно!");
        
    } catch (error) {
        console.error("❌ Ошибка демонстрации:", error.message);
    }
}

// Утилиты для быстрого взаимодействия
async function quickTransfer(to, amount) {
    const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
    await token.transfer(to, ethers.parseEther(amount.toString()));
    console.log(`✅ Переведено ${amount} PRFCT → ${to}`);
}

async function quickAllowance(user, amount) {
    const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
    await token.setSpendingAllowance(user, ethers.parseEther(amount.toString()));
    console.log(`✅ Установлен allowance ${amount} PRFCT для ${user}`);
}

async function quickBurn(amount) {
    const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
    await token.burn(ethers.parseEther(amount.toString()));
    console.log(`✅ Сожжено ${amount} PRFCT`);
}

async function getBalance(address) {
    const token = await ethers.getContractAt("PerfectPitcherToken", CONTRACT_ADDRESS);
    const balance = await token.balanceOf(address);
    console.log(`💰 Баланс ${address}: ${ethers.formatEther(balance)} PRFCT`);
    return balance;
}

// Экспорт функций для использования в других скриптах
module.exports = {
    CONTRACT_ADDRESS,
    quickTransfer,
    quickAllowance,
    quickBurn,
    getBalance,
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

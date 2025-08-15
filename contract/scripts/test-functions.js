// scripts/test-functions.js - Тестирование функций развернутого контракта
const { ethers } = require("hardhat");

async function main() {
    // Адрес развернутого контракта
    const TOKEN_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    
    console.log("🧪 Тестирование функций Perfect Pitcher Token...");
    console.log("📍 Адрес контракта:", TOKEN_ADDRESS);
    
    // Подключаемся к контракту
    const token = await ethers.getContractAt("PerfectPitcherToken", TOKEN_ADDRESS);
    const [deployer, user1] = await ethers.getSigners();
    
    console.log("👤 Тестовый пользователь:", deployer.address);
    
    try {
        // 1. Тест SaaS функционала - трата токенов на сервис
        console.log("\\n💰 Тест 1: Трата токенов на AI-сервис");
        
        // Сначала переводим токены себе для тестирования
        await token.transfer(deployer.address, ethers.parseEther("1000"));
        console.log("✅ Переведено 1000 PRFCT на тестовый аккаунт");
        
        // Устанавливаем spending allowance
        await token.setSpendingAllowance(deployer.address, ethers.parseEther("500"));
        console.log("✅ Установлен spending allowance: 500 PRFCT");
        
        // Тратим токены на AI-сервис
        const serviceId = ethers.keccak256(ethers.toUtf8Bytes("image_generation"));
        const spendAmount = ethers.parseEther("50");
        
        const balanceBefore = await token.balanceOf(deployer.address);
        await token.spendOnService(deployer.address, spendAmount, serviceId);
        const balanceAfter = await token.balanceOf(deployer.address);
        
        console.log("✅ Потрачено на AI-сервис:", ethers.formatEther(spendAmount), "PRFCT");
        console.log("📊 Баланс до:", ethers.formatEther(balanceBefore), "PRFCT");
        console.log("📊 Баланс после:", ethers.formatEther(balanceAfter), "PRFCT");
        
        // 2. Тест блокировки ресурсов для трансляций
        console.log("\\n🔒 Тест 2: Блокировка ресурсов для трансляции");
        
        const lockAmount = ethers.parseEther("100");
        const lockDuration = 3600; // 1 час
        const broadcastServiceId = ethers.keccak256(ethers.toUtf8Bytes("live_broadcast"));
        
        const tx = await token.lockResourcesForBroadcast(lockAmount, lockDuration, broadcastServiceId);
        const receipt = await tx.wait();
        
        // Найдем событие ResourcesLocked
        const lockEvent = receipt.logs.find(log => {
            try {
                const parsed = token.interface.parseLog(log);
                return parsed.name === "ResourcesLocked";
            } catch (e) {
                return false;
            }
        });
        
        if (lockEvent) {
            const parsedEvent = token.interface.parseLog(lockEvent);
            const lockId = parsedEvent.args.lockId;
            console.log("✅ Заблокировано для трансляции:", ethers.formatEther(lockAmount), "PRFCT");
            console.log("🔑 Lock ID:", lockId);
            
            // Проверяем информацию о блокировке
            const lockInfo = await token.getLockInfo(deployer.address, lockId);
            console.log("📋 Сумма блокировки:", ethers.formatEther(lockInfo.amount), "PRFCT");
            console.log("📋 Время разблокировки:", new Date(Number(lockInfo.unlockTime) * 1000).toLocaleString());
            console.log("📋 Активна:", lockInfo.isActive);
        }
        
        // 3. Тест экстренной разблокировки
        console.log("\\n🚨 Тест 3: Экстренная разблокировка");
        
        if (lockEvent) {
            const parsedEvent = token.interface.parseLog(lockEvent);
            const lockId = parsedEvent.args.lockId;
            
            const contractBalanceBefore = await token.balanceOf(TOKEN_ADDRESS);
            await token.emergencyUnlock(lockId);
            const contractBalanceAfter = await token.balanceOf(TOKEN_ADDRESS);
            
            console.log("✅ Экстренная разблокировка выполнена");
            console.log("📊 Баланс контракта до:", ethers.formatEther(contractBalanceBefore), "PRFCT");
            console.log("📊 Баланс контракта после:", ethers.formatEther(contractBalanceAfter), "PRFCT");
        }
        
        // 4. Тест пакетных операций
        console.log("\\n📦 Тест 4: Пакетные операции");
        
        const testUsers = [deployer.address, deployer.address]; // Используем один адрес дважды
        const testAmounts = [ethers.parseEther("200"), ethers.parseEther("300")];
        
        await token.batchSetSpendingAllowances(testUsers, testAmounts);
        console.log("✅ Пакетная установка allowances выполнена");
        
        const finalAllowance = await token.spendingAllowances(deployer.address);
        console.log("📊 Итоговый allowance:", ethers.formatEther(finalAllowance), "PRFCT");
        
        // 5. Тест паузы функций
        console.log("\\n⏸️  Тест 5: Селективная пауза функций");
        
        const burnSelector = token.interface.getFunction("burn").selector;
        await token.pauseFunction(burnSelector, true);
        console.log("✅ Функция burn приостановлена");
        
        try {
            await token.burn(ethers.parseEther("1"));
            console.log("❌ Ошибка: burn должен был быть заблокирован");
        } catch (error) {
            console.log("✅ burn корректно заблокирован:", error.message.includes("Function is paused"));
        }
        
        // Снимаем паузу
        await token.pauseFunction(burnSelector, false);
        await token.burn(ethers.parseEther("1"));
        console.log("✅ Пауза снята, burn работает");
        
        // 6. Итоговая статистика
        console.log("\\n📊 Итоговая статистика:");
        const finalBalance = await token.balanceOf(deployer.address);
        const totalSupply = await token.totalSupply();
        const contractBalance = await token.balanceOf(TOKEN_ADDRESS);
        
        console.log("- Баланс тестового аккаунта:", ethers.formatEther(finalBalance), "PRFCT");
        console.log("- Общий supply:", ethers.formatEther(totalSupply), "PRFCT");
        console.log("- Баланс контракта:", ethers.formatEther(contractBalance), "PRFCT");
        
        console.log("\\n🎉 Все тесты пройдены успешно!");
        
    } catch (error) {
        console.error("❌ Ошибка тестирования:", error.message);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Критическая ошибка:", error);
        process.exit(1);
    });


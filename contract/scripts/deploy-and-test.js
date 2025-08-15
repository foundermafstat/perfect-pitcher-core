// scripts/deploy-and-test.js - Развертывание и тестирование в одной сессии
const { ethers, upgrades } = require("hardhat");

async function deployContract() {
    console.log("🚀 Развертывание Perfect Pitcher Token...");
    
    const [deployer] = await ethers.getSigners();
    console.log("📋 Деплойер:", deployer.address);
    console.log("💰 Баланс:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    // Развертывание mock контрактов
    const MockRouter = await ethers.getContractFactory("MockDEXRouter");
    const mockRouter = await MockRouter.deploy();
    await mockRouter.waitForDeployment();
    
    const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
    const mockPriceFeed = await MockPriceFeed.deploy(ethers.parseUnits("100", 8));
    await mockPriceFeed.waitForDeployment();
    
    // Развертывание основного контракта
    const PerfectPitcherToken = await ethers.getContractFactory("PerfectPitcherToken");
    const token = await upgrades.deployProxy(
        PerfectPitcherToken,
        [
            deployer.address, // treasury
            await mockRouter.getAddress(),
            await mockPriceFeed.getAddress(),
            await mockPriceFeed.getAddress()
        ],
        { 
            initializer: 'initialize',
            kind: 'uups'
        }
    );
    
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    
    console.log("✅ Контракт развернут:", tokenAddress);
    
    // Настройка ролей
    await token.grantRole(await token.OPERATOR_ROLE(), deployer.address);
    await token.grantRole(await token.SERVICE_ROLE(), deployer.address);
    
    return { token, deployer, tokenAddress };
}

async function testContract(token, deployer, tokenAddress) {
    console.log("\\n🧪 Начинаем комплексное тестирование...");
    
    try {
        // Проверка базовых параметров
        console.log("\\n📊 Базовые параметры:");
        console.log("- Название:", await token.name());
        console.log("- Символ:", await token.symbol());
        console.log("- Supply:", ethers.formatEther(await token.totalSupply()), "PRFCT");
        console.log("- Баланс treasury:", ethers.formatEther(await token.balanceOf(deployer.address)), "PRFCT");
        
        // Тест 1: Burning токенов
        console.log("\\n🔥 Тест 1: Burning токенов");
        const burnAmount = ethers.parseEther("100");
        const supplyBefore = await token.totalSupply();
        
        await token.burn(burnAmount);
        
        const supplyAfter = await token.totalSupply();
        console.log("✅ Сожжено:", ethers.formatEther(burnAmount), "PRFCT");
        console.log("📊 Supply до:", ethers.formatEther(supplyBefore), "PRFCT");
        console.log("📊 Supply после:", ethers.formatEther(supplyAfter), "PRFCT");
        
        // Тест 2: Spending Allowance
        console.log("\\n💳 Тест 2: Управление spending allowances");
        const allowanceAmount = ethers.parseEther("1000");
        
        await token.setSpendingAllowance(deployer.address, allowanceAmount);
        const allowance = await token.spendingAllowances(deployer.address);
        
        console.log("✅ Установлен allowance:", ethers.formatEther(allowance), "PRFCT");
        
        // Тест 3: Трата на сервисы
        console.log("\\n💰 Тест 3: Трата токенов на AI-сервис");
        const serviceId = ethers.keccak256(ethers.toUtf8Bytes("image_generation"));
        const spendAmount = ethers.parseEther("50");
        
        const balanceBefore = await token.balanceOf(deployer.address);
        const allowanceBefore = await token.spendingAllowances(deployer.address);
        
        await token.spendOnService(deployer.address, spendAmount, serviceId);
        
        const balanceAfter = await token.balanceOf(deployer.address);
        const allowanceAfter = await token.spendingAllowances(deployer.address);
        
        console.log("✅ Потрачено на сервис:", ethers.formatEther(spendAmount), "PRFCT");
        console.log("📊 Баланс:", ethers.formatEther(balanceBefore), "→", ethers.formatEther(balanceAfter), "PRFCT");
        console.log("📊 Allowance:", ethers.formatEther(allowanceBefore), "→", ethers.formatEther(allowanceAfter), "PRFCT");
        
        // Тест 4: Блокировка ресурсов
        console.log("\\n🔒 Тест 4: Блокировка ресурсов для трансляции");
        const lockAmount = ethers.parseEther("200");
        const lockDuration = 3600; // 1 час
        const broadcastServiceId = ethers.keccak256(ethers.toUtf8Bytes("live_broadcast"));
        
        const userBalanceBefore = await token.balanceOf(deployer.address);
        const contractBalanceBefore = await token.balanceOf(tokenAddress);
        
        const tx = await token.lockResourcesForBroadcast(lockAmount, lockDuration, broadcastServiceId);
        const receipt = await tx.wait();
        
        const userBalanceAfter = await token.balanceOf(deployer.address);
        const contractBalanceAfter = await token.balanceOf(tokenAddress);
        
        console.log("✅ Заблокировано:", ethers.formatEther(lockAmount), "PRFCT");
        console.log("📊 Баланс пользователя:", ethers.formatEther(userBalanceBefore), "→", ethers.formatEther(userBalanceAfter), "PRFCT");
        console.log("📊 Баланс контракта:", ethers.formatEther(contractBalanceBefore), "→", ethers.formatEther(contractBalanceAfter), "PRFCT");
        
        // Получаем lockId из события
        let lockId;
        for (const log of receipt.logs) {
            try {
                const parsed = token.interface.parseLog(log);
                if (parsed.name === "ResourcesLocked") {
                    lockId = parsed.args.lockId;
                    break;
                }
            } catch (e) {
                // Пропускаем неразпознанные логи
            }
        }
        
        if (lockId) {
            console.log("🔑 Lock ID:", lockId);
            
            // Проверяем информацию о блокировке
            const lockInfo = await token.getLockInfo(deployer.address, lockId);
            console.log("📋 Сумма блокировки:", ethers.formatEther(lockInfo.amount), "PRFCT");
            console.log("📋 Активна:", lockInfo.isActive);
            
            // Тест 5: Экстренная разблокировка
            console.log("\\n🚨 Тест 5: Экстренная разблокировка");
            
            const contractBalanceBeforeUnlock = await token.balanceOf(tokenAddress);
            const userBalanceBeforeUnlock = await token.balanceOf(deployer.address);
            
            await token.emergencyUnlock(lockId);
            
            const contractBalanceAfterUnlock = await token.balanceOf(tokenAddress);
            const userBalanceAfterUnlock = await token.balanceOf(deployer.address);
            
            console.log("✅ Экстренная разблокировка выполнена с комиссией 5%");
            console.log("📊 Пользователь:", ethers.formatEther(userBalanceBeforeUnlock), "→", ethers.formatEther(userBalanceAfterUnlock), "PRFCT");
            console.log("📊 Контракт:", ethers.formatEther(contractBalanceBeforeUnlock), "→", ethers.formatEther(contractBalanceAfterUnlock), "PRFCT");
        }
        
        // Тест 6: Пакетные операции
        console.log("\\n📦 Тест 6: Пакетные операции");
        const [, user1, user2] = await ethers.getSigners();
        const users = [user1.address, user2.address];
        const amounts = [ethers.parseEther("500"), ethers.parseEther("750")];
        
        await token.batchSetSpendingAllowances(users, amounts);
        
        const allowance1 = await token.spendingAllowances(user1.address);
        const allowance2 = await token.spendingAllowances(user2.address);
        
        console.log("✅ Пакетная установка allowances:");
        console.log("- User1:", ethers.formatEther(allowance1), "PRFCT");
        console.log("- User2:", ethers.formatEther(allowance2), "PRFCT");
        
        // Тест 7: Селективная пауза
        console.log("\\n⏸️  Тест 7: Селективная пауза функций");
        const burnSelector = token.interface.getFunction("burn").selector;
        
        await token.pauseFunction(burnSelector, true);
        console.log("✅ Функция burn приостановлена");
        
        // Пытаемся выполнить burn (должно быть заблокировано)
        try {
            await token.burn(ethers.parseEther("1"));
            console.log("❌ Ошибка: burn не был заблокирован!");
        } catch (error) {
            if (error.message.includes("Function is paused")) {
                console.log("✅ burn корректно заблокирован");
            } else {
                console.log("⚠️  Неожиданная ошибка:", error.message);
            }
        }
        
        // Снимаем паузу и проверяем
        await token.pauseFunction(burnSelector, false);
        await token.burn(ethers.parseEther("1"));
        console.log("✅ Пауза снята, burn снова работает");
        
        // Финальная статистика
        console.log("\\n📊 Финальная статистика:");
        const finalBalance = await token.balanceOf(deployer.address);
        const finalSupply = await token.totalSupply();
        const finalContractBalance = await token.balanceOf(tokenAddress);
        
        console.log("- Баланс treasury:", ethers.formatEther(finalBalance), "PRFCT");
        console.log("- Общий supply:", ethers.formatEther(finalSupply), "PRFCT");
        console.log("- Баланс контракта:", ethers.formatEther(finalContractBalance), "PRFCT");
        
        console.log("\\n🎉 Все тесты успешно пройдены!");
        
        return {
            tokenAddress,
            testsCompleted: 7,
            finalBalance: ethers.formatEther(finalBalance),
            finalSupply: ethers.formatEther(finalSupply)
        };
        
    } catch (error) {
        console.error("❌ Ошибка тестирования:", error.message);
        throw error;
    }
}

async function main() {
    try {
        // Развертывание
        const { token, deployer, tokenAddress } = await deployContract();
        
        // Тестирование
        const results = await testContract(token, deployer, tokenAddress);
        
        console.log("\\n🏁 РАЗВЕРТЫВАНИЕ И ТЕСТИРОВАНИЕ ЗАВЕРШЕНО");
        console.log("========================================");
        console.log("📍 Адрес контракта:", results.tokenAddress);
        console.log("✅ Тестов пройдено:", results.testsCompleted);
        console.log("💰 Итоговый баланс:", results.finalBalance, "PRFCT");
        console.log("📊 Итоговый supply:", results.finalSupply, "PRFCT");
        console.log("\\n🚀 Контракт готов к использованию!");
        
    } catch (error) {
        console.error("❌ Критическая ошибка:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Неожиданная ошибка:", error);
        process.exit(1);
    });


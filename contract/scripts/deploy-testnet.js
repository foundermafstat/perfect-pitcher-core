// scripts/deploy-testnet.js - Тестовое развертывание с моковыми данными
const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Развертывание Perfect Pitcher Token в тестовом режиме...");
    
    try {
        // Получаем signers (тестовые аккаунты)
        const [deployer] = await ethers.getSigners();
        console.log("📋 Развертывание с адреса:", deployer.address);
        
        // Тестовые адреса (используем адрес деплойера для всех ролей)
        const TREASURY_ADDRESS = deployer.address;
        const ICECREAM_ROUTER = "0x8f08C0D82b04176b5C778BFE5A4b74EF433E4F4A"; // IceCreamSwap Router
        const CORE_PRICE_FEED = deployer.address; // Используем деплойера как mock
        const USDT_PRICE_FEED = deployer.address; // Используем деплойера как mock
        
        console.log("💰 Баланс деплойера:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
        
        // Сначала развертываем mock контракты для тестирования
        console.log("🔧 Развертывание mock контрактов...");
        
        const MockRouter = await ethers.getContractFactory("MockDEXRouter");
        const mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();
        console.log("✅ MockDEXRouter развернут:", await mockRouter.getAddress());
        
        const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
        const mockPriceFeed = await MockPriceFeed.deploy(ethers.parseUnits("100", 8)); // $100
        await mockPriceFeed.waitForDeployment();
        console.log("✅ MockAggregatorV3 развернут:", await mockPriceFeed.getAddress());
        
        // Получение фабрики основного контракта
        const PerfectPitcherToken = await ethers.getContractFactory("PerfectPitcherToken");
        
        // Развертывание через UUPS proxy
        console.log("🔧 Развертывание UUPS proxy контракта...");
        const token = await upgrades.deployProxy(
            PerfectPitcherToken,
            [
                TREASURY_ADDRESS,
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
        
        console.log("✅ Perfect Pitcher Token развернут по адресу:", tokenAddress);
        
        // Получаем адреса proxy компонентов
        try {
            const adminAddress = await upgrades.erc1967.getAdminAddress(tokenAddress);
            const implementationAddress = await upgrades.erc1967.getImplementationAddress(tokenAddress);
            console.log("📝 Proxy admin:", adminAddress);
            console.log("🔧 Implementation:", implementationAddress);
        } catch (error) {
            console.log("⚠️  Не удалось получить proxy адреса:", error.message);
        }
        
        // Проверка базовых параметров токена
        console.log("\\n📊 Параметры токена:");
        console.log("- Название:", await token.name());
        console.log("- Символ:", await token.symbol());
        console.log("- Десятичные знаки:", await token.decimals());
        console.log("- Общий объем эмиссии:", ethers.formatEther(await token.totalSupply()), "PRFCT");
        console.log("- Баланс treasury:", ethers.formatEther(await token.balanceOf(TREASURY_ADDRESS)), "PRFCT");
        
        // Настройка тестовых ролей
        console.log("\\n🔐 Настройка ролей...");
        
        const OPERATOR_ROLE = await token.OPERATOR_ROLE();
        const SERVICE_ROLE = await token.SERVICE_ROLE();
        
        // Добавляем деплойера во все роли для тестирования
        try {
            await token.grantRole(OPERATOR_ROLE, deployer.address);
            console.log(`✅ OPERATOR_ROLE предоставлена: ${deployer.address}`);
        } catch (error) {
            console.log(`⚠️  OPERATOR_ROLE уже предоставлена или ошибка: ${error.message}`);
        }
        
        try {
            await token.grantRole(SERVICE_ROLE, deployer.address);
            console.log(`✅ SERVICE_ROLE предоставлена: ${deployer.address}`);
        } catch (error) {
            console.log(`⚠️  SERVICE_ROLE уже предоставлена или ошибка: ${error.message}`);
        }
        
        // Проверка ролей
        console.log("\\n👥 Статус ролей:");
        console.log("- DEFAULT_ADMIN_ROLE:", await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), deployer.address));
        console.log("- OPERATOR_ROLE:", await token.hasRole(OPERATOR_ROLE, deployer.address));
        console.log("- SERVICE_ROLE:", await token.hasRole(SERVICE_ROLE, deployer.address));
        
        // Проверка конфигурации
        const config = await token.config();
        console.log("\\n⚙️  Конфигурация контракта:");
        console.log("- Максимальная сумма траты:", ethers.formatEther(config.maxSpendingAmount), "PRFCT");
        console.log("- Максимальное время блокировки:", config.maxLockDuration.toString(), "секунд");
        console.log("- Комиссия экстренной разблокировки:", Number(config.emergencyUnlockFee) / 100, "%");
        
        // Тестирование основных функций
        console.log("\\n🧪 Тестирование основных функций...");
        
        try {
            // Тест установки spending allowance
            await token.setSpendingAllowance(deployer.address, ethers.parseEther("1000"));
            const allowance = await token.spendingAllowances(deployer.address);
            console.log("✅ Spending allowance установлен:", ethers.formatEther(allowance), "PRFCT");
            
            // Тест burning токенов
            const burnAmount = ethers.parseEther("100");
            await token.burn(burnAmount);
            console.log("✅ Сожжено токенов:", ethers.formatEther(burnAmount), "PRFCT");
            
            // Проверяем новый баланс
            const newBalance = await token.balanceOf(deployer.address);
            console.log("✅ Новый баланс treasury:", ethers.formatEther(newBalance), "PRFCT");
            
        } catch (error) {
            console.log("⚠️  Ошибка тестирования функций:", error.message);
        }
        
        // Сохранение информации о развертывании
        const deploymentInfo = {
            network: "hardhat-local",
            tokenAddress: tokenAddress,
            mockRouter: await mockRouter.getAddress(),
            mockPriceFeed: await mockPriceFeed.getAddress(),
            treasury: TREASURY_ADDRESS,
            deployer: deployer.address,
            blockNumber: await ethers.provider.getBlockNumber(),
            timestamp: new Date().toISOString(),
            roles: {
                admin: deployer.address,
                operator: deployer.address,
                service: deployer.address
            }
        };
        
        // Выводим итоговую информацию
        console.log("\\n📋 Информация о развертывании:");
        console.table(deploymentInfo);
        
        // Сохранение в файл
        const fs = require('fs');
        const deploymentPath = `./deployments/testnet-deployment-${Date.now()}.json`;
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log("\\n📄 Информация сохранена в:", deploymentPath);
        
        console.log("\\n🎉 Тестовое развертывание завершено успешно!");
        
        // Инструкции для дальнейшего использования
        console.log("\\n📝 Следующие шаги:");
        console.log("1. Контракт развернут и готов к тестированию");
        console.log("2. Все роли назначены на адрес деплойера");
        console.log("3. Можно тестировать функции через Hardhat console");
        console.log("4. Для мониторинга обновите TOKEN_ADDRESS в .env");
        
        return {
            tokenAddress: tokenAddress,
            deploymentInfo: deploymentInfo
        };
        
    } catch (error) {
        console.error("❌ Ошибка развертывания:", error);
        throw error;
    }
}

// Запуск только при прямом вызове
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Критическая ошибка:", error);
            process.exit(1);
        });
}

module.exports = { main };


// scripts/deploy.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Развертывание Perfect Pitcher Token на Core blockchain...");
    
    // Параметры для Core mainnet
    const TREASURY_ADDRESS = "0x742d35Cc6131b3d2F0bF12A1a91B8b58F1a04e5d"; // Адрес treasury (замените на реальный)
    const ICECREAM_ROUTER = "0x8f08C0D82b04176b5C778BFE5A4b74EF433E4F4A"; // IceCreamSwap Router
    const CORE_PRICE_FEED = "0x8418C4Ab5928c1EbD3b6a6b3BC7b2F4a8A2F9e6c"; // Chainlink CORE/USD price feed (замените на реальный)
    const USDT_PRICE_FEED = "0x7B5E8D90e3e1Fc8A82B35a4a3b3E2A1D5B5A8C3E"; // Chainlink USDT/USD price feed (замените на реальный)
    
    const [deployer] = await ethers.getSigners();
    console.log("📋 Развертывание с адреса:", deployer.address);
    console.log("💰 Баланс деплойера:", ethers.utils.formatEther(await deployer.getBalance()), "CORE");
    
    // Получение фабрики контракта
    const PerfectPitcherToken = await ethers.getContractFactory("PerfectPitcherToken");
    
    // Развертывание через UUPS proxy
    console.log("🔧 Развертывание UUPS proxy контракта...");
    const token = await upgrades.deployProxy(
        PerfectPitcherToken,
        [
            TREASURY_ADDRESS,
            ICECREAM_ROUTER,
            CORE_PRICE_FEED,
            USDT_PRICE_FEED
        ],
        { 
            initializer: 'initialize',
            kind: 'uups'
        }
    );
    
    await token.deployed();
    
    console.log("✅ Perfect Pitcher Token развернут по адресу:", token.address);
    console.log("📝 Proxy admin:", await upgrades.erc1967.getAdminAddress(token.address));
    console.log("🔧 Implementation:", await upgrades.erc1967.getImplementationAddress(token.address));
    
    // Проверка базовых параметров токена
    console.log("\\n📊 Параметры токена:");
    console.log("- Название:", await token.name());
    console.log("- Символ:", await token.symbol());
    console.log("- Десятичные знаки:", await token.decimals());
    console.log("- Общий объем эмиссии:", ethers.utils.formatEther(await token.totalSupply()), "PRFCT");
    console.log("- Баланс treasury:", ethers.utils.formatEther(await token.balanceOf(TREASURY_ADDRESS)), "PRFCT");
    
    // Настройка ролей
    console.log("\\n🔐 Настройка ролей...");
    
    const OPERATOR_ROLE = await token.OPERATOR_ROLE();
    const SERVICE_ROLE = await token.SERVICE_ROLE();
    
    // Добавление backend сервера как OPERATOR (замените на реальный адрес)
    const BACKEND_ADDRESS = "0x8C8e6e8E7Af4a1B7B5A9C8D7E3F6A2B1C9D8E7F6"; 
    try {
        await token.grantRole(OPERATOR_ROLE, BACKEND_ADDRESS);
        console.log(`✅ OPERATOR_ROLE предоставлена: ${BACKEND_ADDRESS}`);
    } catch (error) {
        console.log(`⚠️  Роль OPERATOR уже предоставлена или ошибка: ${error.message}`);
    }
    
    // Добавление API сервиса как SERVICE_ROLE (замените на реальный адрес)
    const API_SERVICE_ADDRESS = "0x9D9f7f7F8E8E9F0F1G1H2I3J4K5L6M7N8O9P0Q1R"; 
    try {
        await token.grantRole(SERVICE_ROLE, API_SERVICE_ADDRESS);
        console.log(`✅ SERVICE_ROLE предоставлена: ${API_SERVICE_ADDRESS}`);
    } catch (error) {
        console.log(`⚠️  Роль SERVICE уже предоставлена или ошибка: ${error.message}`);
    }
    
    // Проверка ролей
    console.log("\\n👥 Статус ролей:");
    console.log("- DEFAULT_ADMIN_ROLE (deployer):", await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), deployer.address));
    console.log("- OPERATOR_ROLE (backend):", await token.hasRole(OPERATOR_ROLE, BACKEND_ADDRESS));
    console.log("- SERVICE_ROLE (API):", await token.hasRole(SERVICE_ROLE, API_SERVICE_ADDRESS));
    
    // Проверка конфигурации
    const config = await token.config();
    console.log("\\n⚙️  Конфигурация контракта:");
    console.log("- Максимальная сумма траты:", ethers.utils.formatEther(config.maxSpendingAmount), "PRFCT");
    console.log("- Максимальное время блокировки:", config.maxLockDuration.toString(), "секунд");
    console.log("- Комиссия экстренной разблокировки:", config.emergencyUnlockFee.toString() / 100, "%");
    
    // Верификация контракта
    console.log("\\n🔍 Верификация контракта...");
    if (hre.network.name !== "hardhat") {
        try {
            await hre.run("verify:verify", {
                address: await upgrades.erc1967.getImplementationAddress(token.address),
                constructorArguments: [],
            });
            console.log("✅ Контракт верифицирован");
        } catch (error) {
            console.log("❌ Ошибка верификации:", error.message);
        }
    } else {
        console.log("⚠️  Пропускаем верификацию для локальной сети");
    }
    
    // Сохранение адресов для фронтенда
    const deploymentInfo = {
        network: hre.network.name,
        tokenAddress: token.address,
        proxyAdmin: await upgrades.erc1967.getAdminAddress(token.address),
        implementation: await upgrades.erc1967.getImplementationAddress(token.address),
        treasury: TREASURY_ADDRESS,
        dexRouter: ICECREAM_ROUTER,
        deployer: deployer.address,
        blockNumber: await ethers.provider.getBlockNumber(),
        timestamp: new Date().toISOString(),
        gasUsed: "Рассчитывается...",
        roles: {
            backend: BACKEND_ADDRESS,
            apiService: API_SERVICE_ADDRESS
        }
    };
    
    // Сохранение в файл
    const fs = require('fs');
    const deploymentPath = `./deployments/${hre.network.name}-deployment.json`;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\\n📋 Информация о развертывании сохранена в:", deploymentPath);
    console.log("\\n🎉 Развертывание завершено успешно!");
    
    // Дополнительные инструкции
    console.log("\\n📝 Следующие шаги:");
    console.log("1. Обновите адреса BACKEND_ADDRESS и API_SERVICE_ADDRESS на реальные");
    console.log("2. Обновите адреса ценовых оракулов Chainlink для Core blockchain");
    console.log("3. Настройте мониторинг событий контракта");
    console.log("4. Создайте пул ликвидности на IceCreamSwap");
    console.log("5. Проведите тестирование всех функций на testnet");
}

// Обработчик ошибок
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Ошибка развертывания:", error);
        process.exit(1);
    });


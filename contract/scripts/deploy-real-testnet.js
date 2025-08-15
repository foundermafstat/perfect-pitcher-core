// scripts/deploy-real-testnet.js - Развертывание в реальный Core Testnet
const { ethers, upgrades, network } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Развертывание Perfect Pitcher Token в Core Testnet2");
    console.log("═".repeat(60));
    
    // Проверяем сеть
    console.log("🌐 Сеть:", network.name);
    console.log("🔗 Chain ID:", network.config.chainId);
    console.log("🌍 RPC URL:", network.config.url);
    
    if (network.name !== 'coreTestnet') {
        console.error("❌ Ошибка: Запустите скрипт с --network coreTestnet");
        process.exit(1);
    }
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log("👤 Деплойер:", deployer.address);
        
        // Проверяем баланс
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("💰 Баланс:", ethers.formatEther(balance), "TCORE2");
        
        if (balance < ethers.parseEther("0.1")) {
            console.warn("⚠️  Внимание: Низкий баланс! Рекомендуется иметь минимум 0.1 TCORE2 для деплоя");
        }
        
        // Получаем текущий блок и gas price
        const blockNumber = await ethers.provider.getBlockNumber();
        console.log("📦 Текущий блок:", blockNumber);
        
        // Настраиваем реальные адреса для Core Testnet
        const REAL_ADDRESSES = {
            treasury: deployer.address, // В тестнете используем деплойера как treasury
            // Реальные адреса для Core Testnet (если известны)
            iceCreamRouter: "0x8f08C0D82b04176b5C778BFE5A4b74EF433E4F4A", // Проверьте актуальность
            // Для тестнета можем использовать mock адреса, которые будут созданы
            corePriceFeed: null, // Будет создан mock
            usdtPriceFeed: null, // Будет создан mock
        };
        
        console.log("\\n🏗️  Подготовка к развертыванию...");
        
        // Сначала развертываем mock price feeds для тестнета
        console.log("📊 Развертывание Mock Price Feeds...");
        
        const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
        
        // CORE/USD price feed (~$1.50)
        const corePriceFeed = await MockPriceFeed.deploy(ethers.parseUnits("1.50", 8));
        await corePriceFeed.waitForDeployment();
        REAL_ADDRESSES.corePriceFeed = await corePriceFeed.getAddress();
        console.log("✅ CORE/USD Price Feed:", REAL_ADDRESSES.corePriceFeed);
        
        // USDT/USD price feed (~$1.00)
        const usdtPriceFeed = await MockPriceFeed.deploy(ethers.parseUnits("1.00", 8));
        await usdtPriceFeed.waitForDeployment();
        REAL_ADDRESSES.usdtPriceFeed = await usdtPriceFeed.getAddress();
        console.log("✅ USDT/USD Price Feed:", REAL_ADDRESSES.usdtPriceFeed);
        
        // Развертываем mock DEX router для тестирования
        console.log("\\n🔄 Развертывание Mock DEX Router...");
        const MockRouter = await ethers.getContractFactory("MockDEXRouter");
        const mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();
        const mockRouterAddress = await mockRouter.getAddress();
        console.log("✅ Mock DEX Router:", mockRouterAddress);
        
        // Основной контракт
        console.log("\\n🎯 Развертывание Perfect Pitcher Token...");
        
        const PerfectPitcherToken = await ethers.getContractFactory("PerfectPitcherToken");
        
        console.log("🔧 Параметры инициализации:");
        console.log("  Treasury:", REAL_ADDRESSES.treasury);
        console.log("  DEX Router:", mockRouterAddress);
        console.log("  CORE Price Feed:", REAL_ADDRESSES.corePriceFeed);
        console.log("  USDT Price Feed:", REAL_ADDRESSES.usdtPriceFeed);
        
        // Оценка газа
        console.log("\\n⛽ Оценка стоимости развертывания...");
        
        const gasEstimate = await ethers.provider.estimateGas({
            data: PerfectPitcherToken.bytecode
        });
        
        const gasPrice = await ethers.provider.getFeeData().then(fee => fee.gasPrice);
        const estimatedCost = gasEstimate * gasPrice;
        
        console.log("📊 Газ оценка:", gasEstimate.toString());
        console.log("⛽ Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
        console.log("💸 Примерная стоимость:", ethers.formatEther(estimatedCost), "TCORE2");
        
        // Развертывание через UUPS proxy
        console.log("\\n🚀 Запуск развертывания...");
        
        const token = await upgrades.deployProxy(
            PerfectPitcherToken,
            [
                REAL_ADDRESSES.treasury,
                mockRouterAddress,
                REAL_ADDRESSES.corePriceFeed,
                REAL_ADDRESSES.usdtPriceFeed
            ],
            { 
                initializer: 'initialize',
                kind: 'uups',
                timeout: 0 // Без таймаута для медленных сетей
            }
        );
        
        console.log("⏳ Ожидание подтверждения...");
        await token.waitForDeployment();
        
        const tokenAddress = await token.getAddress();
        console.log("✅ Perfect Pitcher Token развернут!");
        console.log("📍 Proxy адрес:", tokenAddress);
        
        // Получаем implementation адрес
        try {
            const implementationAddress = await upgrades.erc1967.getImplementationAddress(tokenAddress);
            console.log("🔧 Implementation адрес:", implementationAddress);
        } catch (error) {
            console.log("⚠️  Не удалось получить implementation адрес:", error.message);
        }
        
        // Проверяем развертывание
        console.log("\\n🔍 Проверка развертывания...");
        const name = await token.name();
        const symbol = await token.symbol();
        const totalSupply = await token.totalSupply();
        const treasuryBalance = await token.balanceOf(REAL_ADDRESSES.treasury);
        
        console.log("✅ Название:", name);
        console.log("✅ Символ:", symbol);
        console.log("✅ Total Supply:", ethers.formatEther(totalSupply), symbol);
        console.log("✅ Treasury Balance:", ethers.formatEther(treasuryBalance), symbol);
        
        // Настройка ролей
        console.log("\\n🔐 Настройка ролей...");
        
        const OPERATOR_ROLE = await token.OPERATOR_ROLE();
        const SERVICE_ROLE = await token.SERVICE_ROLE();
        
        await token.grantRole(OPERATOR_ROLE, deployer.address);
        console.log("✅ OPERATOR_ROLE предоставлена деплойеру");
        
        await token.grantRole(SERVICE_ROLE, deployer.address);
        console.log("✅ SERVICE_ROLE предоставлена деплойеру");
        
        // Сохранение информации о развертывании
        const deploymentInfo = {
            network: network.name,
            chainId: network.config.chainId,
            rpcUrl: network.config.url,
            deployer: deployer.address,
            deployerBalance: ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
            timestamp: new Date().toISOString(),
            blockNumber: await ethers.provider.getBlockNumber(),
            
            // Адреса контрактов
            tokenProxy: tokenAddress,
            implementation: await upgrades.erc1967.getImplementationAddress(tokenAddress).catch(() => "Неизвестно"),
            treasury: REAL_ADDRESSES.treasury,
            mockRouter: mockRouterAddress,
            corePriceFeed: REAL_ADDRESSES.corePriceFeed,
            usdtPriceFeed: REAL_ADDRESSES.usdtPriceFeed,
            
            // Информация о токене
            tokenName: name,
            tokenSymbol: symbol,
            totalSupply: ethers.formatEther(totalSupply),
            
            // Ссылки
            explorer: `https://scan.test2.btcs.network/address/${tokenAddress}`,
            
            // Настройки для .env
            envVariables: {
                TOKEN_ADDRESS: tokenAddress,
                TREASURY_ADDRESS: REAL_ADDRESSES.treasury,
                MOCK_ROUTER: mockRouterAddress,
                CORE_PRICE_FEED: REAL_ADDRESSES.corePriceFeed,
                USDT_PRICE_FEED: REAL_ADDRESSES.usdtPriceFeed
            }
        };
        
        // Создаем папку deployments если её нет
        if (!fs.existsSync('./deployments')) {
            fs.mkdirSync('./deployments');
        }
        
        // Сохраняем в файл
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const deploymentFile = `./deployments/core-testnet-${timestamp}.json`;
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log("\\n📄 Информация сохранена в:", deploymentFile);
        
        // Итоговая информация
        console.log("\\n🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО УСПЕШНО!");
        console.log("═".repeat(60));
        console.log("📍 Адрес токена:", tokenAddress);
        console.log("🌐 Explorer:", deploymentInfo.explorer);
        console.log("💰 Баланс после деплоя:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "TCORE2");
        
        console.log("\\n📝 Следующие шаги:");
        console.log("1. Добавьте адрес токена в .env файл:");
        console.log(`   TOKEN_ADDRESS=${tokenAddress}`);
        console.log("2. Проверьте контракт в explorer:", deploymentInfo.explorer);
        console.log("3. Начните тестирование функций контракта");
        console.log("4. При необходимости верифицируйте контракт:");
        console.log(`   npx hardhat verify --network coreTestnet ${tokenAddress}`);
        
        return {
            tokenAddress,
            deploymentInfo
        };
        
    } catch (error) {
        console.error("❌ Ошибка развертывания:", error);
        
        // Дополнительная диагностика
        if (error.message.includes("insufficient funds")) {
            console.error("💸 Недостаточно средств! Пополните баланс TCORE2 токенами");
            console.error("🔗 Кран Core Testnet2: https://scan.test2.btcs.network/faucet");
        } else if (error.message.includes("network")) {
            console.error("🌐 Проблема с сетью. Проверьте RPC URL и интернет соединение");
        } else if (error.message.includes("nonce")) {
            console.error("🔢 Проблема с nonce. Попробуйте перезапустить развертывание");
        }
        
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

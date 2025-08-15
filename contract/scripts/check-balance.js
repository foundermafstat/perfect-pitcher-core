// scripts/check-balance.js - Проверка баланса для развертывания
const { ethers, network } = require("hardhat");

async function main() {
    console.log("💰 Проверка баланса для развертывания");
    console.log("═".repeat(50));
    
    console.log("🌐 Сеть:", network.name);
    console.log("🔗 Chain ID:", network.config.chainId);
    console.log("🌍 RPC URL:", network.config.url);
    
    try {
        const [signer] = await ethers.getSigners();
        console.log("👤 Адрес кошелька:", signer.address);
        
        // Получаем баланс
        const balance = await ethers.provider.getBalance(signer.address);
        const balanceInEther = ethers.formatEther(balance);
        
        console.log("💰 Баланс:", balanceInEther, "TCORE2");
        
        // Проверяем достаточность средств
        const minBalance = 0.1; // Минимум 0.1 TCORE2
        const recommendedBalance = 0.5; // Рекомендуется 0.5 TCORE2
        
        if (parseFloat(balanceInEther) < minBalance) {
            console.log("❌ НЕДОСТАТОЧНО СРЕДСТВ!");
            console.log(`🚨 Минимум требуется: ${minBalance} TCORE2`);
            console.log("💡 Получите тестовые токены: https://scan.test2.btcs.network/faucet");
            return false;
        } else if (parseFloat(balanceInEther) < recommendedBalance) {
            console.log("⚠️  Низкий баланс, но достаточно для развертывания");
            console.log(`💡 Рекомендуется: ${recommendedBalance} TCORE2`);
        } else {
            console.log("✅ Достаточно средств для развертывания");
        }
        
        // Проверяем подключение к сети
        console.log("\\n🔍 Проверка подключения к сети...");
        
        const blockNumber = await ethers.provider.getBlockNumber();
        const latestBlock = await ethers.provider.getBlock(blockNumber);
        
        console.log("📦 Текущий блок:", blockNumber);
        console.log("⏰ Время блока:", new Date(latestBlock.timestamp * 1000).toLocaleString());
        
        // Проверяем gas price
        const gasPrice = await ethers.provider.getFeeData().then(fee => fee.gasPrice);
        console.log("⛽ Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
        
        // Оцениваем стоимость развертывания
        const estimatedGas = 5000000; // Примерная оценка
        const estimatedCost = BigInt(estimatedGas) * gasPrice;
        const costInEther = ethers.formatEther(estimatedCost);
        
        console.log("\\n💸 Оценка стоимости развертывания:");
        console.log("📊 Примерный газ:", estimatedGas.toLocaleString());
        console.log("💰 Примерная стоимость:", costInEther, "TCORE2");
        
        const remainingAfterDeploy = parseFloat(balanceInEther) - parseFloat(costInEther);
        console.log("🏦 Останется после деплоя:", remainingAfterDeploy.toFixed(4), "TCORE2");
        
        if (remainingAfterDeploy < 0) {
            console.log("❌ НЕДОСТАТОЧНО для покрытия газа!");
            return false;
        }
        
        console.log("\\n✅ Все проверки пройдены! Готов к развертыванию.");
        return true;
        
    } catch (error) {
        console.error("❌ Ошибка проверки:", error.message);
        
        if (error.message.includes("could not detect network")) {
            console.error("🌐 Проверьте настройки сети в hardhat.config.js");
        } else if (error.message.includes("private key")) {
            console.error("🔑 Проверьте PRIVATE_KEY в .env файле");
        } else if (error.message.includes("network")) {
            console.error("🔗 Проблема с подключением к RPC");
        }
        
        return false;
    }
}

// Дополнительная функция для проверки конфигурации
async function checkConfig() {
    console.log("\\n⚙️  Проверка конфигурации:");
    
    // Проверяем .env файл
    if (!process.env.PRIVATE_KEY) {
        console.log("❌ PRIVATE_KEY не найден в .env");
        return false;
    }
    
    if (process.env.PRIVATE_KEY.length !== 66) {
        console.log("❌ PRIVATE_KEY неверной длины (должен быть 66 символов с 0x)");
        return false;
    }
    
    console.log("✅ PRIVATE_KEY настроен корректно");
    
    // Проверяем сетевые настройки
    if (network.name === 'coreTestnet') {
        console.log("✅ Сеть: Core Testnet");
        console.log("✅ Chain ID:", network.config.chainId);
        console.log("✅ RPC URL:", network.config.url);
    } else {
        console.log("⚠️  Текущая сеть:", network.name);
        console.log("💡 Для развертывания используйте: --network coreTestnet");
    }
    
    return true;
}

// Экспорт для использования в других скриптах
module.exports = { main, checkConfig };

// Запуск при прямом вызове
if (require.main === module) {
    Promise.all([checkConfig(), main()])
        .then(([configOk, balanceOk]) => {
            if (configOk && balanceOk) {
                console.log("\\n🚀 ВСЕ ГОТОВО ДЛЯ РАЗВЕРТЫВАНИЯ!");
                console.log("Запустите: npx hardhat run scripts/deploy-real-testnet.js --network coreTestnet");
            } else {
                console.log("\\n❌ Устраните проблемы перед развертыванием");
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Критическая ошибка:", error);
            process.exit(1);
        });
}

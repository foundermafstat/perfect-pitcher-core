// scripts/monitor-contract.js - Мониторинг событий контракта в реальном времени
const { ethers } = require("hardhat");

// Адрес развернутого контракта в Core Testnet2
const CONTRACT_ADDRESS = "0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A";

class ContractMonitor {
    constructor(contractAddress) {
        this.contractAddress = contractAddress;
        this.token = null;
        this.isMonitoring = false;
        this.eventCounts = {};
        this.startTime = Date.now();
    }

    async initialize() {
        console.log("🔧 Инициализация мониторинга...");
        this.token = await ethers.getContractAt("PerfectPitcherToken", this.contractAddress);
        console.log("✅ Подключен к контракту:", this.contractAddress);
        
        // Показываем базовую информацию
        await this.showContractInfo();
    }

    async showContractInfo() {
        console.log("\n📊 Информация о контракте:");
        console.log("- Название:", await this.token.name());
        console.log("- Символ:", await this.token.symbol());
        console.log("- Supply:", ethers.formatEther(await this.token.totalSupply()), "PRFCT");
        console.log("- Блок:", await ethers.provider.getBlockNumber());
        console.log("- Время:", new Date().toLocaleString());
    }

    startMonitoring() {
        console.log("\n🔍 Начинаем мониторинг событий...");
        console.log("📡 Отслеживаемые события: Transfer, ServiceUsed, ResourcesLocked, ConfigUpdated");
        console.log("⏹️  Нажмите Ctrl+C для остановки\n");
        
        this.isMonitoring = true;

        // Отслеживание Transfer событий
        this.token.on("Transfer", (from, to, value, event) => {
            this.logEvent("Transfer", {
                from: from,
                to: to,
                amount: ethers.formatEther(value) + " PRFCT",
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        // Отслеживание ServiceUsed событий
        this.token.on("ServiceUsed", (user, amount, serviceId, timestamp, event) => {
            this.logEvent("ServiceUsed", {
                user: user,
                amount: ethers.formatEther(amount) + " PRFCT",
                serviceId: serviceId,
                timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        // Отслеживание ResourcesLocked событий
        this.token.on("ResourcesLocked", (user, amount, lockId, unlockTime, serviceId, event) => {
            this.logEvent("ResourcesLocked", {
                user: user,
                amount: ethers.formatEther(amount) + " PRFCT",
                lockId: lockId,
                unlockTime: new Date(Number(unlockTime) * 1000).toLocaleString(),
                serviceId: serviceId,
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        // Отслеживание ResourcesUnlocked событий
        this.token.on("ResourcesUnlocked", (user, amount, lockId, isEmergency, event) => {
            this.logEvent("ResourcesUnlocked", {
                user: user,
                amount: ethers.formatEther(amount) + " PRFCT",
                lockId: lockId,
                isEmergency: isEmergency ? "🚨 Emergency" : "⏰ Normal",
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        // Отслеживание ConfigUpdated событий
        this.token.on("ConfigUpdated", (parameter, oldValue, newValue, event) => {
            this.logEvent("ConfigUpdated", {
                parameter: parameter,
                oldValue: oldValue.toString(),
                newValue: newValue.toString(),
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        // Отслеживание RoleGranted событий
        this.token.on("RoleGranted", (role, account, sender, event) => {
            this.logEvent("RoleGranted", {
                role: this.getRoleName(role),
                account: account,
                sender: sender,
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        // Отслеживание Paused/Unpaused событий
        this.token.on("Paused", (account, event) => {
            this.logEvent("Paused", {
                account: account,
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        this.token.on("Unpaused", (account, event) => {
            this.logEvent("Unpaused", {
                account: account,
                txHash: event.log.transactionHash,
                block: event.log.blockNumber
            });
        });

        // Показываем статистику каждые 30 секунд
        this.statsInterval = setInterval(() => {
            this.showStats();
        }, 30000);
    }

    logEvent(eventName, data) {
        if (!this.isMonitoring) return;

        const timestamp = new Date().toLocaleTimeString();
        const emoji = this.getEventEmoji(eventName);
        
        // Обновляем счетчики
        this.eventCounts[eventName] = (this.eventCounts[eventName] || 0) + 1;

        console.log(`\n${emoji} ${eventName} [${timestamp}]`);
        console.log("─".repeat(50));
        
        for (const [key, value] of Object.entries(data)) {
            console.log(`  ${key}: ${value}`);
        }
        
        console.log("─".repeat(50));
    }

    getEventEmoji(eventName) {
        const emojis = {
            "Transfer": "💸",
            "ServiceUsed": "🤖",
            "ResourcesLocked": "🔒",
            "ResourcesUnlocked": "🔓",
            "ConfigUpdated": "⚙️",
            "RoleGranted": "👑",
            "RoleRevoked": "🚫",
            "Paused": "⏸️",
            "Unpaused": "▶️"
        };
        return emojis[eventName] || "📋";
    }

    getRoleName(roleHash) {
        // Хеши ролей для удобного отображения
        const roles = {
            "0x0000000000000000000000000000000000000000000000000000000000000000": "DEFAULT_ADMIN_ROLE",
            "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929": "OPERATOR_ROLE",
            "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a": "PAUSER_ROLE",
            "0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3": "UPGRADER_ROLE",
            "0x6b91dbd22e8e58fe70c2ab0ac1ff39e0c4c1c4e9a42e24d44ee1bb7facd59ce3": "SERVICE_ROLE"
        };
        return roles[roleHash] || roleHash;
    }

    showStats() {
        const runtime = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(runtime / 60);
        const seconds = runtime % 60;
        
        console.log("\n📊 СТАТИСТИКА МОНИТОРИНГА");
        console.log("═".repeat(50));
        console.log(`⏱️  Время работы: ${minutes}м ${seconds}с`);
        console.log(`📅 Текущее время: ${new Date().toLocaleString()}`);
        
        if (Object.keys(this.eventCounts).length > 0) {
            console.log("\n📈 События за сессию:");
            for (const [event, count] of Object.entries(this.eventCounts)) {
                console.log(`  ${this.getEventEmoji(event)} ${event}: ${count}`);
            }
        } else {
            console.log("\n💤 Событий пока не зафиксировано");
        }
        console.log("═".repeat(50));
    }

    async getRecentEvents(fromBlock = -100) {
        console.log("\n📜 Получение последних событий...");
        
        try {
            const currentBlock = await ethers.provider.getBlockNumber();
            const startBlock = Math.max(0, currentBlock + fromBlock);
            
            console.log(`🔍 Поиск событий с блока ${startBlock} по ${currentBlock}`);
            
            const transferFilter = this.token.filters.Transfer();
            const transfers = await this.token.queryFilter(transferFilter, startBlock);
            
            const serviceFilter = this.token.filters.ServiceUsed();
            const services = await this.token.queryFilter(serviceFilter, startBlock);
            
            const lockFilter = this.token.filters.ResourcesLocked();
            const locks = await this.token.queryFilter(lockFilter, startBlock);
            
            console.log(`\n📊 Найдено событий:`);
            console.log(`  💸 Transfers: ${transfers.length}`);
            console.log(`  🤖 Service Used: ${services.length}`);
            console.log(`  🔒 Resources Locked: ${locks.length}`);
            
            // Показываем последние 5 событий каждого типа
            if (transfers.length > 0) {
                console.log("\n💸 Последние Transfers:");
                transfers.slice(-5).forEach(event => {
                    console.log(`  ${event.args.from} → ${event.args.to}: ${ethers.formatEther(event.args.value)} PRFCT`);
                });
            }
            
        } catch (error) {
            console.error("❌ Ошибка получения событий:", error.message);
        }
    }

    stopMonitoring() {
        console.log("\n⏹️  Остановка мониторинга...");
        this.isMonitoring = false;
        
        if (this.token) {
            this.token.removeAllListeners();
        }
        
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
        
        this.showStats();
        console.log("✅ Мониторинг остановлен");
    }
}

async function main() {
    const monitor = new ContractMonitor(CONTRACT_ADDRESS);
    
    try {
        await monitor.initialize();
        
        // Показываем последние события
        await monitor.getRecentEvents(-50);
        
        // Запускаем мониторинг
        monitor.startMonitoring();
        
        // Обработчик для graceful shutdown
        process.on('SIGINT', () => {
            monitor.stopMonitoring();
            process.exit(0);
        });
        
        // Бесконечный цикл для поддержания мониторинга
        while (monitor.isMonitoring) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } catch (error) {
        console.error("❌ Ошибка мониторинга:", error);
        process.exit(1);
    }
}

// Экспорт для использования в других скриптах
module.exports = { ContractMonitor, CONTRACT_ADDRESS };

// Запуск при прямом вызове
if (require.main === module) {
    main();
}

// scripts/monitor.js - Система мониторинга событий Perfect Pitcher Token
const { ethers } = require("hardhat");
const WebSocket = require('ws');
const fs = require('fs');

// Конфигурация
const CONFIG = {
    TOKEN_ADDRESS: process.env.TOKEN_ADDRESS || "0x...", // Адрес развернутого контракта
    NETWORK: process.env.NETWORK || "coreTestnet",
    WEBHOOK_URL: process.env.WEBHOOK_URL || null, // Discord/Slack webhook для уведомлений
    LOG_FILE: "./logs/monitor.log",
    ALERT_THRESHOLDS: {
        LARGE_SPENDING: ethers.utils.parseEther("10000"), // 10k токенов
        LARGE_LOCK: ethers.utils.parseEther("50000"),     // 50k токенов
        LARGE_SWAP: ethers.utils.parseEther("1000"),      // 1k токенов
        EMERGENCY_EVENTS: true // Мониторинг экстренных событий
    }
};

class PerfectPitcherMonitor {
    constructor() {
        this.token = null;
        this.provider = null;
        this.isRunning = false;
        this.eventCounts = {
            serviceSpending: 0,
            resourcesLocked: 0,
            resourcesUnlocked: 0,
            swapExecuted: 0,
            emergencyEvents: 0
        };
        this.startTime = Date.now();
        
        this.initializeLogger();
    }
    
    async initialize() {
        try {
            console.log("🚀 Инициализация Perfect Pitcher Monitor...");
            console.log(`📡 Сеть: ${CONFIG.NETWORK}`);
            console.log(`📍 Адрес контракта: ${CONFIG.TOKEN_ADDRESS}`);
            
            // Подключение к провайдеру
            this.provider = ethers.provider;
            
            // Подключение к контракту
            this.token = await ethers.getContractAt("PerfectPitcherToken", CONFIG.TOKEN_ADDRESS);
            
            // Проверка подключения
            const name = await this.token.name();
            const symbol = await this.token.symbol();
            const totalSupply = await this.token.totalSupply();
            
            console.log(`✅ Подключен к контракту: ${name} (${symbol})`);
            console.log(`📊 Общий объем эмиссии: ${ethers.utils.formatEther(totalSupply)} PRFCT`);
            
            this.log("Monitor initialized successfully", "INFO");
            return true;
            
        } catch (error) {
            console.error("❌ Ошибка инициализации:", error.message);
            this.log(\`Initialization failed: \${error.message}\`, "ERROR");
            return false;
        }
    }
    
    async startMonitoring() {
        if (!this.token) {
            console.error("❌ Контракт не инициализирован. Запустите initialize() сначала.");
            return;
        }
        
        console.log("🔍 Запуск мониторинга событий...");
        this.isRunning = true;
        
        // Мониторинг основных SaaS событий
        this.setupServiceSpendingMonitor();
        this.setupResourceLockingMonitor();
        this.setupSwapMonitor();
        this.setupSecurityMonitor();
        this.setupAdminMonitor();
        
        // Периодическая статистика
        this.setupPeriodicReports();
        
        console.log("✅ Мониторинг активен!");
        this.log("Monitoring started", "INFO");
    }
    
    setupServiceSpendingMonitor() {
        this.token.on("ServiceSpending", async (user, amount, serviceId, service, event) => {
            this.eventCounts.serviceSpending++;
            
            const amountFormatted = ethers.utils.formatEther(amount);
            const serviceIdString = ethers.utils.parseBytes32String(serviceId);
            
            const logData = {
                type: 'service_spending',
                user,
                amount: amountFormatted,
                serviceId: serviceIdString,
                service,
                txHash: event.transactionHash,
                blockNumber: event.blockNumber,
                timestamp: Date.now()
            };
            
            console.log(\`🔥 Service Spending:
                👤 User: \${user}
                💰 Amount: \${amountFormatted} PRFCT
                🛠️  Service: \${serviceIdString}
                🏢 Provider: \${service}
                📄 Tx: \${event.transactionHash}
            \`);
            
            this.log(\`ServiceSpending: \${user} spent \${amountFormatted} PRFCT on \${serviceIdString}\`, "INFO");
            
            // Отправка в систему аналитики
            await this.sendToAnalytics(logData);
            
            // Проверка на крупные траты
            if (ethers.utils.parseEther(amountFormatted).gte(CONFIG.ALERT_THRESHOLDS.LARGE_SPENDING)) {
                await this.sendAlert(\`🚨 Крупная трата: \${amountFormatted} PRFCT пользователем \${user}\`);
            }
        });
    }
    
    setupResourceLockingMonitor() {
        // Мониторинг блокировок
        this.token.on("ResourcesLocked", async (user, amount, serviceId, lockId, event) => {
            this.eventCounts.resourcesLocked++;
            
            const amountFormatted = ethers.utils.formatEther(amount);
            const serviceIdString = ethers.utils.parseBytes32String(serviceId);
            
            console.log(\`🔒 Resources Locked:
                👤 User: \${user}
                💰 Amount: \${amountFormatted} PRFCT
                🛠️  Service: \${serviceIdString}
                🔑 Lock ID: \${lockId}
                📄 Tx: \${event.transactionHash}
            \`);
            
            this.log(\`ResourcesLocked: \${user} locked \${amountFormatted} PRFCT for \${serviceIdString}\`, "INFO");
            
            if (ethers.utils.parseEther(amountFormatted).gte(CONFIG.ALERT_THRESHOLDS.LARGE_LOCK)) {
                await this.sendAlert(\`🔒 Крупная блокировка: \${amountFormatted} PRFCT пользователем \${user}\`);
            }
        });
        
        // Мониторинг разблокировок
        this.token.on("ResourcesUnlocked", async (user, amount, lockId, event) => {
            this.eventCounts.resourcesUnlocked++;
            
            const amountFormatted = ethers.utils.formatEther(amount);
            
            console.log(\`🔓 Resources Unlocked:
                👤 User: \${user}
                💰 Amount: \${amountFormatted} PRFCT
                🔑 Lock ID: \${lockId}
                📄 Tx: \${event.transactionHash}
            \`);
            
            this.log(\`ResourcesUnlocked: \${user} unlocked \${amountFormatted} PRFCT\`, "INFO");
        });
        
        // Мониторинг экстренных разблокировок
        this.token.on("EmergencyUnlock", async (user, lockId, fee, event) => {
            this.eventCounts.emergencyEvents++;
            
            const feeFormatted = ethers.utils.formatEther(fee);
            
            console.log(\`🚨 Emergency Unlock:
                👤 User: \${user}
                🔑 Lock ID: \${lockId}
                💸 Fee: \${feeFormatted} PRFCT
                📄 Tx: \${event.transactionHash}
            \`);
            
            await this.sendAlert(\`🚨 Экстренная разблокировка пользователем \${user}, комиссия: \${feeFormatted} PRFCT\`);
            this.log(\`EmergencyUnlock: \${user} emergency unlocked with fee \${feeFormatted} PRFCT\`, "WARNING");
        });
    }
    
    setupSwapMonitor() {
        this.token.on("SwapExecuted", async (user, coreAmount, usdtAmount, prfctAmount, treasuryFee, event) => {
            this.eventCounts.swapExecuted++;
            
            const coreFormatted = ethers.utils.formatEther(coreAmount);
            const usdtFormatted = ethers.utils.formatUnits(usdtAmount, 6);
            const prfctFormatted = ethers.utils.formatEther(prfctAmount);
            const feeFormatted = ethers.utils.formatUnits(treasuryFee, 6);
            
            console.log(\`💱 Swap Executed:
                👤 User: \${user}
                🪙 CORE: \${coreFormatted}
                💵 USDT: \${usdtFormatted}
                🎯 PRFCT: \${prfctFormatted}
                💸 Fee: \${feeFormatted} USDT
                📄 Tx: \${event.transactionHash}
            \`);
            
            this.log(\`SwapExecuted: \${user} swapped \${coreFormatted} CORE for \${prfctFormatted} PRFCT\`, "INFO");
            
            if (ethers.utils.parseEther(prfctFormatted).gte(CONFIG.ALERT_THRESHOLDS.LARGE_SWAP)) {
                await this.sendAlert(\`💱 Крупный обмен: \${prfctFormatted} PRFCT пользователем \${user}\`);
            }
        });
    }
    
    setupSecurityMonitor() {
        // Мониторинг паузы
        this.token.on("Paused", async (account, event) => {
            this.eventCounts.emergencyEvents++;
            
            console.log(\`⏸️  Contract Paused by: \${account}\`);
            await this.sendAlert(\`🚨 КОНТРАКТ ПРИОСТАНОВЛЕН администратором \${account}\`);
            this.log(\`Contract paused by \${account}\`, "CRITICAL");
        });
        
        this.token.on("Unpaused", async (account, event) => {
            console.log(\`▶️  Contract Unpaused by: \${account}\`);
            await this.sendAlert(\`✅ Контракт возобновлен администратором \${account}\`);
            this.log(\`Contract unpaused by \${account}\`, "INFO");
        });
        
        // Мониторинг селективной паузы функций
        this.token.on("FunctionPauseChanged", async (selector, paused, event) => {
            const action = paused ? "приостановлена" : "возобновлена";
            console.log(\`🔧 Function \${selector} \${action}\`);
            this.log(\`Function \${selector} pause changed to \${paused}\`, "WARNING");
        });
    }
    
    setupAdminMonitor() {
        // Мониторинг изменений ролей
        this.token.on("RoleGranted", async (role, account, sender, event) => {
            console.log(\`👑 Role Granted: \${role} to \${account} by \${sender}\`);
            this.log(\`Role \${role} granted to \${account} by \${sender}\`, "WARNING");
        });
        
        this.token.on("RoleRevoked", async (role, account, sender, event) => {
            console.log(\`👑 Role Revoked: \${role} from \${account} by \${sender}\`);
            await this.sendAlert(\`🔐 Роль \${role} отозвана у \${account}\`);
            this.log(\`Role \${role} revoked from \${account} by \${sender}\`, "WARNING");
        });
        
        // Мониторинг обновлений allowances
        this.token.on("SpendingAllowanceUpdated", async (user, amount, event) => {
            const amountFormatted = ethers.utils.formatEther(amount);
            console.log(\`💳 Spending Allowance Updated: \${user} -> \${amountFormatted} PRFCT\`);
            this.log(\`SpendingAllowance updated for \${user}: \${amountFormatted} PRFCT\`, "INFO");
        });
    }
    
    setupPeriodicReports() {
        // Отчет каждые 5 минут
        setInterval(() => {
            this.generatePeriodicReport();
        }, 5 * 60 * 1000);
        
        // Ежедневный отчет
        setInterval(() => {
            this.generateDailyReport();
        }, 24 * 60 * 60 * 1000);
    }
    
    generatePeriodicReport() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        console.log(\`\\n📊 === ПЕРИОДИЧЕСКИЙ ОТЧЕТ ===\`);
        console.log(\`⏱️  Время работы: \${hours}ч \${minutes}м\`);
        console.log(\`🔥 Траты на сервисы: \${this.eventCounts.serviceSpending}\`);
        console.log(\`🔒 Блокировки ресурсов: \${this.eventCounts.resourcesLocked}\`);
        console.log(\`🔓 Разблокировки: \${this.eventCounts.resourcesUnlocked}\`);
        console.log(\`💱 Обмены: \${this.eventCounts.swapExecuted}\`);
        console.log(\`🚨 Экстренные события: \${this.eventCounts.emergencyEvents}\`);
        console.log(\`=================================\\n\`);
        
        this.log(\`Periodic report: \${JSON.stringify(this.eventCounts)}\`, "INFO");
    }
    
    async generateDailyReport() {
        try {
            const totalSupply = await this.token.totalSupply();
            const contractBalance = await this.token.balanceOf(this.token.address);
            
            const report = {
                date: new Date().toISOString().split('T')[0],
                totalSupply: ethers.utils.formatEther(totalSupply),
                contractBalance: ethers.utils.formatEther(contractBalance),
                eventCounts: { ...this.eventCounts },
                uptime: Math.floor((Date.now() - this.startTime) / 1000)
            };
            
            // Сохранение отчета
            const reportPath = \`./reports/daily-\${report.date}.json\`;
            await this.ensureDirectoryExists('./reports');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            
            console.log(\`📈 Ежедневный отчет сохранен: \${reportPath}\`);
            this.log(\`Daily report generated: \${reportPath}\`, "INFO");
            
        } catch (error) {
            console.error("❌ Ошибка генерации ежедневного отчета:", error.message);
            this.log(\`Daily report generation failed: \${error.message}\`, "ERROR");
        }
    }
    
    async sendToAnalytics(data) {
        try {
            // Отправка в систему аналитики (замените на реальный API)
            if (process.env.ANALYTICS_API_URL) {
                const response = await fetch(process.env.ANALYTICS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(\`Analytics API error: \${response.status}\`);
                }
            }
        } catch (error) {
            console.error("⚠️  Ошибка отправки в аналитику:", error.message);
            this.log(\`Analytics send failed: \${error.message}\`, "WARNING");
        }
    }
    
    async sendAlert(message) {
        try {
            console.log(\`🚨 ALERT: \${message}\`);
            
            // Отправка в Telegram/Discord/Slack
            if (CONFIG.WEBHOOK_URL) {
                const payload = {
                    content: \`🤖 **Perfect Pitcher Monitor**\\n\${message}\`,
                    timestamp: new Date().toISOString()
                };
                
                const response = await fetch(CONFIG.WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(\`Webhook error: \${response.status}\`);
                }
            }
            
            this.log(\`ALERT: \${message}\`, "ALERT");
            
        } catch (error) {
            console.error("⚠️  Ошибка отправки уведомления:", error.message);
            this.log(\`Alert send failed: \${error.message}\`, "ERROR");
        }
    }
    
    initializeLogger() {
        this.ensureDirectoryExists('./logs');
    }
    
    async ensureDirectoryExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    log(message, level = "INFO") {
        const timestamp = new Date().toISOString();
        const logLine = \`[\${timestamp}] [\${level}] \${message}\\n\`;
        
        // Запись в файл
        fs.appendFileSync(CONFIG.LOG_FILE, logLine);
        
        // Вывод в консоль для критических сообщений
        if (level === "ERROR" || level === "CRITICAL" || level === "ALERT") {
            console.error(logLine.trim());
        }
    }
    
    stop() {
        console.log("🛑 Остановка мониторинга...");
        this.isRunning = false;
        this.token.removeAllListeners();
        this.log("Monitoring stopped", "INFO");
    }
    
    // Graceful shutdown
    setupGracefulShutdown() {
        process.on('SIGINT', () => {
            console.log('\\n👋 Получен сигнал SIGINT, остановка мониторинга...');
            this.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('\\n👋 Получен сигнал SIGTERM, остановка мониторинга...');
            this.stop();
            process.exit(0);
        });
    }
}

// Основная функция запуска
async function main() {
    const monitor = new PerfectPitcherMonitor();
    
    // Настройка graceful shutdown
    monitor.setupGracefulShutdown();
    
    // Инициализация и запуск
    const initialized = await monitor.initialize();
    if (initialized) {
        await monitor.startMonitoring();
        
        // Поддержание работы процесса
        setInterval(() => {
            if (!monitor.isRunning) {
                console.log("❌ Мониторинг неактивен, перезапуск...");
                monitor.startMonitoring();
            }
        }, 30000); // Проверка каждые 30 секунд
    } else {
        console.error("❌ Не удалось инициализировать мониторинг");
        process.exit(1);
    }
}

// Запуск при прямом вызове
if (require.main === module) {
    main().catch((error) => {
        console.error("❌ Критическая ошибка мониторинга:", error);
        process.exit(1);
    });
}

module.exports = { PerfectPitcherMonitor, CONFIG };


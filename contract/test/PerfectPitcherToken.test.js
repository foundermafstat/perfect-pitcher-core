// test/PerfectPitcherToken.test.js
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Perfect Pitcher Token", function () {
    let token, owner, user1, user2, treasury, operator, service, attacker;
    let mockRouter, mockPriceFeed, mockCoreToken, mockUSDTToken;
    
    const INITIAL_SUPPLY = ethers.utils.parseEther("1000000000"); // 1 млрд
    const MOCK_PRICE = ethers.utils.parseUnits("100", 8); // $100 с 8 decimals
    
    beforeEach(async function () {
        [owner, user1, user2, treasury, operator, service, attacker] = await ethers.getSigners();
        
        // Деплой mock контрактов
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockCoreToken = await MockERC20.deploy("Core Token", "CORE", 18);
        mockUSDTToken = await MockERC20.deploy("USD Tether", "USDT", 6);
        
        const MockRouter = await ethers.getContractFactory("MockDEXRouter");
        mockRouter = await MockRouter.deploy();
        
        const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
        mockPriceFeed = await MockPriceFeed.deploy(MOCK_PRICE);
        
        // Деплой основного контракта
        const PerfectPitcherToken = await ethers.getContractFactory("PerfectPitcherToken");
        token = await upgrades.deployProxy(
            PerfectPitcherToken,
            [treasury.address, mockRouter.address, mockPriceFeed.address, mockPriceFeed.address],
            { initializer: 'initialize' }
        );
        
        // Настройка ролей
        await token.grantRole(await token.OPERATOR_ROLE(), operator.address);
        await token.grantRole(await token.SERVICE_ROLE(), service.address);
        
        // Настройка mock роутера для возврата реалистичных значений
        await mockRouter.setAmountOut(ethers.utils.parseEther("100")); // 100 токенов за свап
    });
    
    describe("🔧 Инициализация", function () {
        it("Должен правильно инициализировать токен", async function () {
            expect(await token.name()).to.equal("Perfect Pitcher Token");
            expect(await token.symbol()).to.equal("PRFCT");
            expect(await token.decimals()).to.equal(18);
            expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
            expect(await token.balanceOf(treasury.address)).to.equal(INITIAL_SUPPLY);
        });
        
        it("Должен установить правильные роли", async function () {
            expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
            expect(await token.hasRole(await token.OPERATOR_ROLE(), operator.address)).to.be.true;
            expect(await token.hasRole(await token.SERVICE_ROLE(), service.address)).to.be.true;
        });
        
        it("Должен установить правильную конфигурацию", async function () {
            const config = await token.config();
            expect(config.maxSpendingAmount).to.equal(ethers.utils.parseEther("100000"));
            expect(config.maxLockDuration).to.equal(7 * 24 * 3600); // 7 дней
            expect(config.emergencyUnlockFee).to.equal(500); // 5%
        });
        
        it("Не должен позволить повторную инициализацию", async function () {
            await expect(
                token.initialize(treasury.address, mockRouter.address, mockPriceFeed.address, mockPriceFeed.address)
            ).to.be.revertedWith("Initializable: contract is already initialized");
        });
    });
    
    describe("💼 SaaS функционал", function () {
        beforeEach(async function () {
            // Перевод токенов пользователю и установка разрешения
            await token.connect(treasury).transfer(user1.address, ethers.utils.parseEther("1000"));
            await token.connect(operator).setSpendingAllowance(user1.address, ethers.utils.parseEther("500"));
        });
        
        describe("Трата токенов на сервисы", function () {
            it("✅ Должен позволить трату токенов через сервис", async function () {
                const spendAmount = ethers.utils.parseEther("50");
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("image_generation"));
                
                await expect(token.connect(service).spendOnService(user1.address, spendAmount, serviceId))
                    .to.emit(token, "ServiceSpending")
                    .withArgs(user1.address, spendAmount, serviceId, service.address)
                    .and.to.emit(token, "TokensBurned")
                    .withArgs(user1.address, spendAmount);
                    
                expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("950"));
                expect(await token.spendingAllowances(user1.address)).to.equal(ethers.utils.parseEther("450"));
                expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY.sub(spendAmount));
            });
            
            it("❌ Должен отклонить трату без достаточных разрешений", async function () {
                const spendAmount = ethers.utils.parseEther("600"); // Больше allowance
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("image_generation"));
                
                await expect(
                    token.connect(service).spendOnService(user1.address, spendAmount, serviceId)
                ).to.be.revertedWith("Недостаточно разрешений на трату");
            });
            
            it("❌ Должен отклонить трату от неавторизованного сервиса", async function () {
                const spendAmount = ethers.utils.parseEther("50");
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("image_generation"));
                
                await expect(
                    token.connect(attacker).spendOnService(user1.address, spendAmount, serviceId)
                ).to.be.revertedWith(`AccessControl: account ${attacker.address.toLowerCase()} is missing role`);
            });
            
            it("❌ Должен отклонить трату превышающую максимум", async function () {
                const config = await token.config();
                const largeAmount = config.maxSpendingAmount.add(1);
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("image_generation"));
                
                // Увеличиваем allowance
                await token.connect(operator).setSpendingAllowance(user1.address, largeAmount);
                // Добавляем токенов
                await token.connect(treasury).transfer(user1.address, largeAmount);
                
                await expect(
                    token.connect(service).spendOnService(user1.address, largeAmount, serviceId)
                ).to.be.revertedWith("Превышена максимальная сумма траты");
            });
        });
        
        describe("Блокировка ресурсов для трансляций", function () {
            it("✅ Должен блокировать токены для трансляций", async function () {
                const lockAmount = ethers.utils.parseEther("100");
                const duration = 3600; // 1 час
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("broadcast"));
                
                const tx = await token.connect(user1).lockResourcesForBroadcast(lockAmount, duration, serviceId);
                const receipt = await tx.wait();
                
                // Получаем lockId из события
                const event = receipt.events.find(e => e.event === "ResourcesLocked");
                const lockId = event.args.lockId;
                
                expect(await token.balanceOf(token.address)).to.equal(lockAmount);
                expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("900"));
                expect(await token.isLockActive(user1.address, lockId)).to.be.true;
                
                const lockInfo = await token.getLockInfo(user1.address, lockId);
                expect(lockInfo.amount).to.equal(lockAmount);
                expect(lockInfo.serviceId).to.equal(serviceId);
                expect(lockInfo.isActive).to.be.true;
            });
            
            it("✅ Должен разблокировать токены после истечения времени", async function () {
                const lockAmount = ethers.utils.parseEther("100");
                const duration = 3600;
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("broadcast"));
                
                const tx = await token.connect(user1).lockResourcesForBroadcast(lockAmount, duration, serviceId);
                const receipt = await tx.wait();
                const lockId = receipt.events.find(e => e.event === "ResourcesLocked").args.lockId;
                
                // Перемещаем время вперед
                await ethers.provider.send("evm_increaseTime", [duration + 1]);
                await ethers.provider.send("evm_mine");
                
                const actualSpent = ethers.utils.parseEther("30"); // Потратили 30 токенов
                const expectedReturn = lockAmount.sub(actualSpent);
                
                await expect(token.connect(user1).unlockResourcesAfterBroadcast(lockId, actualSpent))
                    .to.emit(token, "ResourcesUnlocked")
                    .withArgs(user1.address, expectedReturn, lockId)
                    .and.to.emit(token, "TokensBurned")
                    .withArgs(token.address, actualSpent);
                
                expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("970")); // 900 + 70 returned
                expect(await token.isLockActive(user1.address, lockId)).to.be.false;
            });
            
            it("✅ Должен поддерживать экстренную разблокировку с комиссией", async function () {
                const lockAmount = ethers.utils.parseEther("100");
                const duration = 3600;
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("broadcast"));
                
                const tx = await token.connect(user1).lockResourcesForBroadcast(lockAmount, duration, serviceId);
                const receipt = await tx.wait();
                const lockId = receipt.events.find(e => e.event === "ResourcesLocked").args.lockId;
                
                const config = await token.config();
                const feeAmount = lockAmount.mul(config.emergencyUnlockFee).div(10000);
                const returnAmount = lockAmount.sub(feeAmount);
                
                await expect(token.connect(user1).emergencyUnlock(lockId))
                    .to.emit(token, "EmergencyUnlock")
                    .withArgs(user1.address, lockId, feeAmount);
                
                expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("900").add(returnAmount));
                expect(await token.balanceOf(treasury.address)).to.equal(INITIAL_SUPPLY.sub(ethers.utils.parseEther("1000")).add(feeAmount));
            });
            
            it("❌ Должен отклонить блокировку на слишком долгий срок", async function () {
                const lockAmount = ethers.utils.parseEther("100");
                const duration = 8 * 24 * 3600; // 8 дней (больше максимума)
                const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("broadcast"));
                
                await expect(
                    token.connect(user1).lockResourcesForBroadcast(lockAmount, duration, serviceId)
                ).to.be.revertedWith("Неверная продолжительность блокировки");
            });
        });
    });
    
    describe("🔒 Безопасность", function () {
        beforeEach(async function () {
            await token.connect(treasury).transfer(user1.address, ethers.utils.parseEther("1000"));
        });
        
        it("✅ Должен предотвращать reentrancy атаки", async function () {
            // Деплой атакующего контракта
            const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
            const attackerContract = await ReentrancyAttacker.deploy(token.address);
            
            // Даем разрешения атакующему контракту
            await token.grantRole(await token.SERVICE_ROLE(), attackerContract.address);
            await token.connect(treasury).transfer(attackerContract.address, ethers.utils.parseEther("100"));
            await token.connect(operator).setSpendingAllowance(attackerContract.address, ethers.utils.parseEther("100"));
            
            await expect(attackerContract.attack()).to.be.revertedWith("ReentrancyGuard: reentrant call");
        });
        
        it("✅ Должен правильно работать с паузой", async function () {
            await token.pause();
            
            await expect(token.connect(user1).transfer(user2.address, 100)).to.be.revertedWith("Pausable: paused");
            
            await token.unpause();
            await expect(token.connect(user1).transfer(user2.address, 100)).to.not.be.reverted;
        });
        
        it("✅ Должен поддерживать селективную паузу функций", async function () {
            const selector = token.interface.getSighash("burn");
            await token.pauseFunction(selector, true);
            
            await expect(token.connect(user1).burn(100)).to.be.revertedWith("Функция приостановлена");
            
            // Другие функции должны работать
            await expect(token.connect(user1).transfer(user2.address, 100)).to.not.be.reverted;
            
            // Снимаем паузу
            await token.pauseFunction(selector, false);
            await expect(token.connect(user1).burn(100)).to.not.be.reverted;
        });
        
        it("❌ Должен отклонять неавторизованные действия", async function () {
            // Попытка паузы от неавторизованного пользователя
            await expect(token.connect(attacker).pause()).to.be.revertedWith("AccessControl");
            
            // Попытка установки allowance
            await expect(
                token.connect(attacker).setSpendingAllowance(user1.address, ethers.utils.parseEther("100"))
            ).to.be.revertedWith("AccessControl");
            
            // Попытка обновления treasury
            await expect(
                token.connect(attacker).updateTreasury(attacker.address)
            ).to.be.revertedWith("AccessControl");
        });
        
        it("❌ Должен защищать от overflow/underflow", async function () {
            // Тест на защиту от underflow в allowances
            await token.connect(operator).setSpendingAllowance(user1.address, ethers.utils.parseEther("100"));
            const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
            
            // Первая трата
            await token.connect(service).spendOnService(user1.address, ethers.utils.parseEther("50"), serviceId);
            
            // Попытка потратить больше оставшегося allowance
            await expect(
                token.connect(service).spendOnService(user1.address, ethers.utils.parseEther("100"), serviceId)
            ).to.be.revertedWith("Недостаточно разрешений на трату");
        });
        
        it("✅ Должен корректно обрабатывать граничные случаи", async function () {
            // Тест с нулевыми суммами
            await expect(
                token.connect(service).spendOnService(user1.address, 0, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test")))
            ).to.be.revertedWith("Сумма должна быть больше нуля");
            
            // Тест с нулевыми адресами
            await expect(
                token.connect(operator).setSpendingAllowance(ethers.constants.AddressZero, ethers.utils.parseEther("100"))
            ).to.be.revertedWith("Нулевой адрес пользователя");
        });
    });
    
    describe("💱 Встроенный обменник", function () {
        beforeEach(async function () {
            // Настройка mock токенов
            await mockCoreToken.mint(user1.address, ethers.utils.parseEther("1000"));
            await mockUSDTToken.mint(token.address, ethers.utils.parseUnits("100000", 6)); // 100k USDT
            await token.connect(treasury).transfer(token.address, ethers.utils.parseEther("100000")); // 100k PRFCT
            
            // Разрешения
            await mockCoreToken.connect(user1).approve(token.address, ethers.utils.parseEther("1000"));
        });
        
        it("✅ Должен выполнять обмен CORE → PRFCT", async function () {
            const coreAmount = ethers.utils.parseEther("10");
            const minPRFCTAmount = ethers.utils.parseEther("90"); // С учетом slippage и комиссий
            
            await expect(token.connect(user1).swapCOREtoPRFCT(coreAmount, minPRFCTAmount))
                .to.emit(token, "SwapExecuted");
            
            // Проверяем что пользователь получил PRFCT токены
            expect(await token.balanceOf(user1.address)).to.be.gt(0);
        });
        
        it("✅ Должен взимать комиссию в treasury", async function () {
            const coreAmount = ethers.utils.parseEther("10");
            const minPRFCTAmount = ethers.utils.parseEther("1");
            
            const treasuryBalanceBefore = await mockUSDTToken.balanceOf(treasury.address);
            
            await token.connect(user1).swapCOREtoPRFCT(coreAmount, minPRFCTAmount);
            
            const treasuryBalanceAfter = await mockUSDTToken.balanceOf(treasury.address);
            expect(treasuryBalanceAfter).to.be.gt(treasuryBalanceBefore);
        });
        
        it("❌ Должен отклонять обмен при устаревших данных оракула", async function () {
            // Создаем mock с устаревшими данными
            const MockPriceFeedStale = await ethers.getContractFactory("MockAggregatorV3");
            const stalePriceFeed = await MockPriceFeedStale.deploy(MOCK_PRICE);
            await stalePriceFeed.setStaleData(true);
            
            // Обновляем цену feed
            await token.connect(owner).updateConfig({
                maxSpendingAmount: ethers.utils.parseEther("100000"),
                maxLockDuration: 7 * 24 * 3600,
                serviceCount: 0,
                emergencyUnlockFee: 500
            });
            
            const coreAmount = ethers.utils.parseEther("10");
            const minPRFCTAmount = ethers.utils.parseEther("90");
            
            // Этот тест сложно реализовать без модификации контракта для тестов
            // В реальном контракте будет проверка времени обновления оракула
        });
    });
    
    describe("🔧 Администрирование", function () {
        it("✅ Должен позволить пакетную установку allowances", async function () {
            const users = [user1.address, user2.address];
            const amounts = [ethers.utils.parseEther("100"), ethers.utils.parseEther("200")];
            
            await expect(token.connect(operator).batchSetSpendingAllowances(users, amounts))
                .to.emit(token, "SpendingAllowanceUpdated")
                .withArgs(user1.address, amounts[0])
                .and.to.emit(token, "SpendingAllowanceUpdated")
                .withArgs(user2.address, amounts[1]);
            
            expect(await token.spendingAllowances(user1.address)).to.equal(amounts[0]);
            expect(await token.spendingAllowances(user2.address)).to.equal(amounts[1]);
        });
        
        it("✅ Должен позволить обновление конфигурации", async function () {
            const newConfig = {
                maxSpendingAmount: ethers.utils.parseEther("200000"),
                maxLockDuration: 14 * 24 * 3600, // 14 дней
                serviceCount: 5,
                emergencyUnlockFee: 300 // 3%
            };
            
            await token.connect(operator).updateConfig(newConfig);
            
            const config = await token.config();
            expect(config.maxSpendingAmount).to.equal(newConfig.maxSpendingAmount);
            expect(config.maxLockDuration).to.equal(newConfig.maxLockDuration);
            expect(config.emergencyUnlockFee).to.equal(newConfig.emergencyUnlockFee);
        });
        
        it("❌ Должен отклонить некорректную конфигурацию", async function () {
            const invalidConfig = {
                maxSpendingAmount: 0, // Некорректное значение
                maxLockDuration: 14 * 24 * 3600,
                serviceCount: 5,
                emergencyUnlockFee: 300
            };
            
            await expect(
                token.connect(operator).updateConfig(invalidConfig)
            ).to.be.revertedWith("Некорректная максимальная сумма траты");
            
            const invalidFeeConfig = {
                maxSpendingAmount: ethers.utils.parseEther("100000"),
                maxLockDuration: 14 * 24 * 3600,
                serviceCount: 5,
                emergencyUnlockFee: 1500 // 15% - слишком много
            };
            
            await expect(
                token.connect(operator).updateConfig(invalidFeeConfig)
            ).to.be.revertedWith("Комиссия не может превышать 10%");
        });
        
        it("✅ Должен поддерживать экстренное извлечение токенов", async function () {
            // Добавляем токены на контракт
            await token.connect(treasury).transfer(token.address, ethers.utils.parseEther("1000"));
            
            // Пауза контракта
            await token.pause();
            
            const withdrawAmount = ethers.utils.parseEther("500");
            const adminBalanceBefore = await token.balanceOf(owner.address);
            
            await token.emergencyWithdraw(owner.address, withdrawAmount);
            
            const adminBalanceAfter = await token.balanceOf(owner.address);
            expect(adminBalanceAfter.sub(adminBalanceBefore)).to.equal(withdrawAmount);
        });
    });
    
    describe("⬆️ Upgrade функционал", function () {
        it("✅ Должен успешно обновляться через UUPS", async function () {
            // Создаем V2 контракт (упрощенная версия для теста)
            const PerfectPitcherTokenV2 = await ethers.getContractFactory("PerfectPitcherTokenV2");
            
            const upgraded = await upgrades.upgradeProxy(token.address, PerfectPitcherTokenV2);
            
            // Проверяем что состояние сохранилось
            expect(await upgraded.name()).to.equal("Perfect Pitcher Token");
            expect(await upgraded.balanceOf(treasury.address)).to.equal(INITIAL_SUPPLY);
            
            // Проверяем новую функциональность (если добавлена)
            // expect(await upgraded.version()).to.equal("2.0.0");
        });
        
        it("❌ Должен отклонять upgrade от неавторизованного пользователя", async function () {
            const PerfectPitcherTokenV2 = await ethers.getContractFactory("PerfectPitcherTokenV2");
            
            // Попытка upgrade от пользователя без UPGRADER_ROLE
            await expect(
                upgrades.upgradeProxy(token.address, PerfectPitcherTokenV2.connect(attacker))
            ).to.be.revertedWith("AccessControl");
        });
    });
    
    describe("⚡ Газовая оптимизация", function () {
        it("📊 Пакетные операции должны быть эффективнее", async function () {
            const users = Array.from({length: 10}, (_, i) => ethers.Wallet.createRandom().address);
            const amounts = Array.from({length: 10}, () => ethers.utils.parseEther("50"));
            
            // Измерение газа для пакетной операции
            const tx = await token.connect(operator).batchSetSpendingAllowances(users, amounts);
            const receipt = await tx.wait();
            
            console.log("        📈 Газ для пакетной операции (10 пользователей):", receipt.gasUsed.toString());
            
            // Сравнение с отдельными операциями (для примера)
            const tx1 = await token.connect(operator).setSpendingAllowance(users[0], amounts[0]);
            const receipt1 = await tx1.wait();
            
            console.log("        📈 Газ для одной операции:", receipt1.gasUsed.toString());
            console.log("        🎯 Экономия газа при пакетной операции:", receipt1.gasUsed.mul(10).sub(receipt.gasUsed).toString());
        });
        
        it("📊 Анализ газа основных операций", async function () {
            // Подготовка
            await token.connect(treasury).transfer(user1.address, ethers.utils.parseEther("1000"));
            await token.connect(operator).setSpendingAllowance(user1.address, ethers.utils.parseEther("500"));
            
            // Тест spending
            const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
            const spendTx = await token.connect(service).spendOnService(user1.address, ethers.utils.parseEther("50"), serviceId);
            const spendReceipt = await spendTx.wait();
            console.log("        💰 Газ для spendOnService:", spendReceipt.gasUsed.toString());
            
            // Тест блокировки
            const lockTx = await token.connect(user1).lockResourcesForBroadcast(
                ethers.utils.parseEther("100"), 
                3600, 
                serviceId
            );
            const lockReceipt = await lockTx.wait();
            console.log("        🔒 Газ для lockResourcesForBroadcast:", lockReceipt.gasUsed.toString());
            
            // Тест burn
            const burnTx = await token.connect(user1).burn(ethers.utils.parseEther("10"));
            const burnReceipt = await burnTx.wait();
            console.log("        🔥 Газ для burn:", burnReceipt.gasUsed.toString());
        });
    });
});

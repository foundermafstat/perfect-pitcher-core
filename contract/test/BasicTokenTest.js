// test/BasicTokenTest.js - Базовые тесты для Perfect Pitcher Token
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Perfect Pitcher Token - Basic Tests", function () {
    let token, owner, user1, treasury, operator, service;
    let mockRouter, mockPriceFeed;
    
    const INITIAL_SUPPLY = ethers.parseEther("1000000000"); // 1 млрд
    
    beforeEach(async function () {
        [owner, user1, treasury, operator, service] = await ethers.getSigners();
        
        // Создаем простые mock контракты
        const MockContract = await ethers.getContractFactory("MockDEXRouter");
        mockRouter = await MockContract.deploy();
        
        const MockAggregator = await ethers.getContractFactory("MockAggregatorV3");
        mockPriceFeed = await MockAggregator.deploy(ethers.parseUnits("100", 8));
        
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
    });
    
    describe("✅ Базовое развертывание", function () {
        it("Должен правильно инициализировать токен", async function () {
            expect(await token.name()).to.equal("Perfect Pitcher Token");
            expect(await token.symbol()).to.equal("PRFCT");
            expect(await token.decimals()).to.equal(18);
            expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
        });
        
        it("Treasury должен получить начальный supply", async function () {
            expect(await token.balanceOf(treasury.address)).to.equal(INITIAL_SUPPLY);
        });
        
        it("Должен установить правильные роли", async function () {
            expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
            expect(await token.hasRole(await token.OPERATOR_ROLE(), operator.address)).to.be.true;
            expect(await token.hasRole(await token.SERVICE_ROLE(), service.address)).to.be.true;
        });
    });
    
    describe("💼 Основные ERC20 функции", function () {
        beforeEach(async function () {
            // Перевод токенов пользователю для тестов
            await token.connect(treasury).transfer(user1.address, ethers.utils.parseEther("1000"));
        });
        
        it("Должен позволить переводы токенов", async function () {
            const transferAmount = ethers.utils.parseEther("100");
            await token.connect(user1).transfer(owner.address, transferAmount);
            
            expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("900"));
            expect(await token.balanceOf(owner.address)).to.equal(transferAmount);
        });
        
        it("Должен поддерживать allowances", async function () {
            const allowanceAmount = ethers.utils.parseEther("500");
            await token.connect(user1).approve(owner.address, allowanceAmount);
            
            expect(await token.allowance(user1.address, owner.address)).to.equal(allowanceAmount);
        });
        
        it("Должен позволить сжигание токенов", async function () {
            const burnAmount = ethers.utils.parseEther("100");
            const supplyBefore = await token.totalSupply();
            
            await token.connect(user1).burn(burnAmount);
            
            expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("900"));
            expect(await token.totalSupply()).to.equal(supplyBefore.sub(burnAmount));
        });
    });
    
    describe("🔧 Административные функции", function () {
        it("Должен позволить установку spending allowance", async function () {
            const allowanceAmount = ethers.utils.parseEther("500");
            
            await token.connect(operator).setSpendingAllowance(user1.address, allowanceAmount);
            
            expect(await token.spendingAllowances(user1.address)).to.equal(allowanceAmount);
        });
        
        it("Должен позволить обновление treasury", async function () {
            const newTreasury = ethers.Wallet.createRandom().address;
            
            await token.connect(owner).updateTreasury(newTreasury);
            
            expect(await token.treasury()).to.equal(newTreasury);
        });
        
        it("Должен позволить обновление конфигурации", async function () {
            const newConfig = {
                maxSpendingAmount: ethers.utils.parseEther("200000"),
                maxLockDuration: 14 * 24 * 3600, // 14 дней
                serviceCount: 5,
                emergencyUnlockFee: 300 // 3%
            };
            
            await token.connect(operator).updateConfig(newConfig);
            
            const config = await token.config();
            expect(config.maxSpendingAmount).to.equal(newConfig.maxSpendingAmount);
            expect(config.emergencyUnlockFee).to.equal(newConfig.emergencyUnlockFee);
        });
    });
    
    describe("💰 SaaS функционал", function () {
        beforeEach(async function () {
            // Подготовка для SaaS тестов
            await token.connect(treasury).transfer(user1.address, ethers.utils.parseEther("1000"));
            await token.connect(operator).setSpendingAllowance(user1.address, ethers.utils.parseEther("500"));
        });
        
        it("Должен позволить трату токенов через сервис", async function () {
            const spendAmount = ethers.utils.parseEther("50");
            const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_service"));
            
            await expect(token.connect(service).spendOnService(user1.address, spendAmount, serviceId))
                .to.emit(token, "ServiceSpending")
                .withArgs(user1.address, spendAmount, serviceId, service.address);
            
            expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("950"));
            expect(await token.spendingAllowances(user1.address)).to.equal(ethers.utils.parseEther("450"));
        });
        
        it("Должен блокировать токены для ресурсов", async function () {
            const lockAmount = ethers.utils.parseEther("100");
            const duration = 3600; // 1 час
            const serviceId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("broadcast"));
            
            await expect(token.connect(user1).lockResourcesForBroadcast(lockAmount, duration, serviceId))
                .to.emit(token, "ResourcesLocked");
            
            expect(await token.balanceOf(token.address)).to.equal(lockAmount);
            expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("900"));
        });
    });
    
    describe("🔒 Паузы и безопасность", function () {
        it("Должен поддерживать паузу контракта", async function () {
            await token.pause();
            
            await expect(
                token.connect(user1).transfer(owner.address, 100)
            ).to.be.revertedWith("Pausable: paused");
            
            await token.unpause();
            
            // После снятия паузы переводы должны работать
            await token.connect(treasury).transfer(user1.address, 100);
            await token.connect(user1).transfer(owner.address, 100);
        });
        
        it("Должен поддерживать селективную паузу функций", async function () {
            const selector = token.interface.getSighash("burn");
            await token.pauseFunction(selector, true);
            
            await token.connect(treasury).transfer(user1.address, 100);
            
            await expect(
                token.connect(user1).burn(50)
            ).to.be.revertedWith("Function is paused");
            
            // Снимаем паузу
            await token.pauseFunction(selector, false);
            await token.connect(user1).burn(50); // Должно работать
        });
    });
    
    describe("📊 View функции", function () {
        it("Должен возвращать правильную информацию о конфигурации", async function () {
            const config = await token.config();
            
            expect(config.maxSpendingAmount).to.equal(ethers.utils.parseEther("100000"));
            expect(config.maxLockDuration).to.equal(7 * 24 * 3600); // 7 дней
            expect(config.emergencyUnlockFee).to.equal(500); // 5%
        });
        
        it("Должен возвращать константы токена", async function () {
            expect(await token.MAX_SUPPLY()).to.equal(ethers.utils.parseEther("10000000000"));
            expect(await token.INITIAL_SUPPLY()).to.equal(ethers.utils.parseEther("1000000000"));
            expect(await token.TREASURY_FEE()).to.equal(100); // 1%
        });
    });
});

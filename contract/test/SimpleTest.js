// test/SimpleTest.js - Простые тесты для Perfect Pitcher Token
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Perfect Pitcher Token - Simple Tests", function () {
    let mockRouter, mockPriceFeed;
    
    beforeEach(async function () {
        // Создаем простые mock контракты
        const MockContract = await ethers.getContractFactory("MockDEXRouter");
        mockRouter = await MockContract.deploy();
        
        const MockAggregator = await ethers.getContractFactory("MockAggregatorV3");
        mockPriceFeed = await MockAggregator.deploy(10000000000); // 100 USD with 8 decimals
    });
    
    describe("✅ Mock контракты", function () {
        it("MockDEXRouter должен развернуться", async function () {
            expect(mockRouter.address).to.be.properAddress;
        });
        
        it("MockAggregatorV3 должен развернуться", async function () {
            expect(mockPriceFeed.address).to.be.properAddress;
        });
        
        it("MockAggregatorV3 должен возвращать цену", async function () {
            const result = await mockPriceFeed.latestRoundData();
            expect(result.answer).to.equal(10000000000);
        });
    });
    
    describe("🔧 Интерфейсы", function () {
        it("IDEXRouter интерфейс должен компилироваться", async function () {
            const IDEXRouter = await ethers.getContractFactory("MockDEXRouter");
            expect(IDEXRouter).to.exist;
        });
        
        it("AggregatorV3Interface должен компилироваться", async function () {
            const AggregatorV3 = await ethers.getContractFactory("MockAggregatorV3");
            expect(AggregatorV3).to.exist;
        });
        
        it("MockERC20 должен компилироваться", async function () {
            const MockERC20 = await ethers.getContractFactory("MockERC20");
            expect(MockERC20).to.exist;
        });
    });
    
    describe("📝 Основной контракт", function () {
        it("PerfectPitcherToken должен компилироваться", async function () {
            const PerfectPitcherToken = await ethers.getContractFactory("PerfectPitcherToken");
            expect(PerfectPitcherToken).to.exist;
        });
        
        it("PerfectPitcherTokenV2 должен компилироваться", async function () {
            const PerfectPitcherTokenV2 = await ethers.getContractFactory("PerfectPitcherTokenV2");
            expect(PerfectPitcherTokenV2).to.exist;
        });
    });
});


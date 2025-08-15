// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/AggregatorV3Interface.sol";
import "./interfaces/IDEXRouter.sol";

/**
 * @title Perfect Pitcher Token ($PRFCT)
 * @dev Upgradeable токен для SaaS платформы с встроенным обменником
 * Версия: 1.0.0 для Core blockchain
 */
contract PerfectPitcherToken is 
    ERC20Upgradeable,
    PausableUpgradeable, 
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ========== КОНСТАНТЫ И РОЛИ ==========
    
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant SERVICE_ROLE = keccak256("SERVICE_ROLE");
    
    // Параметры токена
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 1e18;     // 10 млрд токенов
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 1e18; // 1 млрд начальная эмиссия
    uint256 public constant TREASURY_FEE = 100;                    // 1% комиссия (100 basis points)
    uint256 private constant MAX_FEE = 10000;                      // 100%
    
    // DEX параметры
    uint256 public constant MAX_SLIPPAGE = 500;   // 5%
    uint24 public constant CORE_USDT_FEE = 3000;  // 0.3% pool fee
    uint24 public constant USDT_PRFCT_FEE = 3000; // 0.3% pool fee
    
    // ========== СОСТОЯНИЕ КОНТРАКТА ==========
    
    // Адреса контрактов
    IDEXRouter public dexRouter;
    AggregatorV3Interface public corePriceFeed;
    AggregatorV3Interface public usdtPriceFeed;
    
    address public constant CORE_TOKEN = 0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f; // CORE на Core blockchain
    address public constant USDT_TOKEN = 0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1;  // USDT на Core blockchain
    address public treasury;
    
    // SaaS функционал
    struct ResourceLock {
        uint256 amount;        // Заблокированная сумма
        uint256 unlockTime;    // Время разблокировки
        bytes32 serviceId;     // ID сервиса
        bool isActive;         // Активен ли лок
    }
    
    mapping(address => mapping(bytes32 => ResourceLock)) public resourceLocks;
    mapping(address => uint256) public spendingAllowances;
    mapping(bytes4 => bool) public pausedFunctions;
    
    // Gas optimization: packed configuration
    struct Config {
        uint128 maxSpendingAmount;    // Максимальная сумма для трат
        uint64 maxLockDuration;       // Максимальное время блокировки
        uint32 serviceCount;          // Количество сервисов
        uint32 emergencyUnlockFee;    // Комиссия за экстренную разблокировку
    }
    
    Config public config;
    
    // ========== СОБЫТИЯ ==========
    
    event TokensBurned(address indexed account, uint256 amount);
    event ServiceSpending(address indexed user, uint256 amount, bytes32 indexed serviceId, address indexed service);
    event ResourcesLocked(address indexed user, uint256 amount, bytes32 indexed serviceId, bytes32 indexed lockId);
    event ResourcesUnlocked(address indexed user, uint256 amount, bytes32 indexed lockId);
    event TreasuryFeeCollected(uint256 amount, address token);
    event SwapExecuted(address indexed user, uint256 coreAmount, uint256 usdtAmount, uint256 prfctAmount, uint256 treasuryFee);
    event FunctionPauseChanged(bytes4 indexed selector, bool paused);
    event SpendingAllowanceUpdated(address indexed user, uint256 amount);
    event EmergencyUnlock(address indexed user, bytes32 indexed lockId, uint256 fee);
    
    // ========== МОДИФИКАТОРЫ ==========
    
    modifier onlyValidAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than zero");
        _;
    }
    
    modifier whenFunctionNotPaused(bytes4 selector) {
        require(!paused() && !pausedFunctions[selector], "Function is paused");
        _;
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    
    function initialize(
        address _treasury,
        address _dexRouter,
        address _corePriceFeed,
        address _usdtPriceFeed
    ) public initializer {
        __ERC20_init("Perfect Pitcher Token", "PRFCT");
        __Pausable_init();
        __AccessControl_init(); 
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        // Установка ролей
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        
        // Установка адресов
        treasury = _treasury;
        dexRouter = IDEXRouter(_dexRouter);
        corePriceFeed = AggregatorV3Interface(_corePriceFeed);
        usdtPriceFeed = AggregatorV3Interface(_usdtPriceFeed);
        
        // Начальная конфигурация
        config = Config({
            maxSpendingAmount: 100_000 * 1e18,  // 100k токенов максимум за одну трату
            maxLockDuration: 7 days,            // Максимум 7 дней блокировки
            serviceCount: 0,
            emergencyUnlockFee: 500             // 5% комиссия за экстренную разблокировку
        });
        
        // Минт начального supply
        _mint(_treasury, INITIAL_SUPPLY);
        
        emit Transfer(address(0), _treasury, INITIAL_SUPPLY);
    }
    
    // ========== CORE SaaS ФУНКЦИОНАЛ ==========
    
    /**
     * @dev Трата токенов на генерацию контента через SaaS API
     * @param user Адрес пользователя
     * @param amount Количество токенов к трате
     * @param serviceId ID сервиса (генерация изображений, текстов, презентаций)
     */
    function spendOnService(
        address user,
        uint256 amount,
        bytes32 serviceId
    )
        external
        onlyRole(SERVICE_ROLE)
        nonReentrant
        whenFunctionNotPaused(this.spendOnService.selector)
        onlyValidAmount(amount)
    {
        require(user != address(0), "Zero address user");
        require(spendingAllowances[user] >= amount, "Insufficient spending allowance");
        require(balanceOf(user) >= amount, "Insufficient token balance");
        require(amount <= config.maxSpendingAmount, "Amount exceeds maximum spending limit");
        
        // Списание разрешения и сжигание токенов
        spendingAllowances[user] -= amount;
        _burn(user, amount);
        
        emit ServiceSpending(user, amount, serviceId, msg.sender);
    }
    
    /**
     * @dev Блокировка токенов для трансляций через AI-агента
     * @param amount Количество токенов для блокировки
     * @param duration Продолжительность блокировки (в секундах)
     * @param serviceId ID сервиса трансляции
     */
    function lockResourcesForBroadcast(
        uint256 amount,
        uint256 duration,
        bytes32 serviceId
    ) 
        external
        nonReentrant
        whenFunctionNotPaused(this.lockResourcesForBroadcast.selector)
        onlyValidAmount(amount)
    {
        require(duration > 0 && duration <= config.maxLockDuration, "Invalid lock duration");
        require(balanceOf(msg.sender) >= amount, "Insufficient tokens for locking");
        
        bytes32 lockId = keccak256(abi.encodePacked(msg.sender, serviceId, block.timestamp));
        require(!resourceLocks[msg.sender][lockId].isActive, "Lock already exists");
        
        // Создание блокировки
        resourceLocks[msg.sender][lockId] = ResourceLock({
            amount: amount,
            unlockTime: block.timestamp + duration,
            serviceId: serviceId,
            isActive: true
        });
        
        // Перевод токенов на контракт
        _transfer(msg.sender, address(this), amount);
        
        emit ResourcesLocked(msg.sender, amount, serviceId, lockId);
    }
    
    /**
     * @dev Разблокировка токенов после завершения трансляции
     * @param lockId ID блокировки
     * @param actualSpent Фактически потраченные токены
     */
    function unlockResourcesAfterBroadcast(
        bytes32 lockId,
        uint256 actualSpent
    )
        external
        nonReentrant
        whenFunctionNotPaused(this.unlockResourcesAfterBroadcast.selector)
    {
        ResourceLock storage lock = resourceLocks[msg.sender][lockId];
        require(lock.isActive, "Lock not active");
        require(block.timestamp >= lock.unlockTime, "Lock not yet expired");
        require(actualSpent <= lock.amount, "Spent more than locked");
        
        uint256 toReturn = lock.amount - actualSpent;
        lock.isActive = false;
        
        // Сжигание потраченных токенов
        if (actualSpent > 0) {
            _burn(address(this), actualSpent);
        }
        
        // Возврат оставшихся токенов
        if (toReturn > 0) {
            _transfer(address(this), msg.sender, toReturn);
        }
        
        emit ResourcesUnlocked(msg.sender, toReturn, lockId);
        if (actualSpent > 0) {
            emit TokensBurned(address(this), actualSpent);
        }
    }
    
    /**
     * @dev Экстренная разблокировка с комиссией (для чрезвычайных ситуаций)
     * @param lockId ID блокировки для экстренного снятия
     */
    function emergencyUnlock(bytes32 lockId) 
        external
        nonReentrant
        whenFunctionNotPaused(this.emergencyUnlock.selector)
    {
        ResourceLock storage lock = resourceLocks[msg.sender][lockId];
        require(lock.isActive, "Lock not active");
        
        uint256 feeAmount = (lock.amount * config.emergencyUnlockFee) / MAX_FEE;
        uint256 returnAmount = lock.amount - feeAmount;
        
        lock.isActive = false;
        
        // Комиссия в treasury
        if (feeAmount > 0) {
            _transfer(address(this), treasury, feeAmount);
        }
        
        // Возврат за вычетом комиссии
        _transfer(address(this), msg.sender, returnAmount);
        
        emit EmergencyUnlock(msg.sender, lockId, feeAmount);
        emit ResourcesUnlocked(msg.sender, returnAmount, lockId);
    }
    
    // ========== ВСТРОЕННЫЙ ОБМЕННИК ==========
    
    /**
     * @dev Обмен CORE/USDT на токены PRFCT через встроенный DEX
     * @param coreAmount Количество CORE токенов для обмена
     * @param minPRFCTAmount Минимальное количество PRFCT к получению
     */
    function swapCOREtoPRFCT(
        uint256 coreAmount,
        uint256 minPRFCTAmount
    ) 
        external
        nonReentrant
        whenFunctionNotPaused(this.swapCOREtoPRFCT.selector)
        onlyValidAmount(coreAmount)
    {
        // Валидация цен через оракулы
        uint256 corePrice = _getValidatedPrice(corePriceFeed);
        uint256 usdtPrice = _getValidatedPrice(usdtPriceFeed);
        
        // Перевод CORE токенов от пользователя
        IERC20(CORE_TOKEN).transferFrom(msg.sender, address(this), coreAmount);
        
        // Первый свап: CORE → USDT
        uint256 usdtAmount = _swapCOREtoUSDT(coreAmount, corePrice);
        
        // Взимание комиссии в treasury (1%)
        uint256 treasuryFee = (usdtAmount * TREASURY_FEE) / MAX_FEE;
        uint256 netUSDTAmount = usdtAmount - treasuryFee;
        
        if (treasuryFee > 0) {
            IERC20(USDT_TOKEN).transfer(treasury, treasuryFee);
            emit TreasuryFeeCollected(treasuryFee, USDT_TOKEN);
        }
        
        // Второй свап: USDT → PRFCT
        uint256 prfctAmount = _swapUSDTtoPRFCT(netUSDTAmount, minPRFCTAmount);
        
        // Отправка PRFCT токенов пользователю
        _transfer(address(this), msg.sender, prfctAmount);
        
        emit SwapExecuted(msg.sender, coreAmount, usdtAmount, prfctAmount, treasuryFee);
    }
    
    /**
     * @dev Внутренняя функция свапа CORE → USDT
     */
    function _swapCOREtoUSDT(uint256 coreAmount, uint256 corePrice) internal returns (uint256) {
        // Расчет ожидаемой суммы USDT с учетом slippage protection
        uint256 expectedUSDT = (coreAmount * corePrice) / 1e18;
        uint256 minUSDT = (expectedUSDT * (MAX_FEE - MAX_SLIPPAGE)) / MAX_FEE;
        
        // Выполнение свапа через DEX
        address[] memory path = new address[](2);
        path[0] = CORE_TOKEN;
        path[1] = USDT_TOKEN;
        
        IERC20(CORE_TOKEN).approve(address(dexRouter), coreAmount);
        
        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            coreAmount,
            minUSDT,
            path,
            address(this),
            block.timestamp + 300 // 5 минут deadline
        );
        
        return amounts[1]; // Количество полученного USDT
    }
    
    /**
     * @dev Внутренняя функция свапа USDT → PRFCT
     */
    function _swapUSDTtoPRFCT(uint256 usdtAmount, uint256 minPRFCTAmount) internal returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = USDT_TOKEN;
        path[1] = address(this);
        
        IERC20(USDT_TOKEN).approve(address(dexRouter), usdtAmount);
        
        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            usdtAmount,
            minPRFCTAmount,
            path,
            address(this),
            block.timestamp + 300
        );
        
        return amounts[1]; // Количество полученного PRFCT
    }
    
    /**
     * @dev Валидация цены через Chainlink оракул
     */
    function _getValidatedPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        
        require(price > 0, "Invalid oracle price");
        require(block.timestamp - updatedAt <= 3600, "Stale oracle data"); // 1 hour
        
        return uint256(price);
    }
    
    // ========== УПРАВЛЕНИЕ РАЗРЕШЕНИЯМИ ==========
    
    /**
     * @dev Установка лимита трат для пользователя
     * @param user Адрес пользователя
     * @param amount Максимальная сумма для трат
     */
    function setSpendingAllowance(address user, uint256 amount) 
        external 
        onlyRole(OPERATOR_ROLE) 
    {
        require(user != address(0), "Zero address user");
        spendingAllowances[user] = amount;
        emit SpendingAllowanceUpdated(user, amount);
    }
    
    /**
     * @dev Пакетная установка лимитов трат
     * @param users Массив адресов пользователей
     * @param amounts Массив лимитов трат
     */
    function batchSetSpendingAllowances(
        address[] calldata users,
        uint256[] calldata amounts
    ) 
        external 
        onlyRole(OPERATOR_ROLE) 
    {
        require(users.length == amounts.length, "Array length mismatch");
        require(users.length <= 200, "Too many users"); // Gas limit protection
        
        for (uint256 i; i < users.length;) {
            require(users[i] != address(0), "Zero address user");
            spendingAllowances[users[i]] = amounts[i];
            emit SpendingAllowanceUpdated(users[i], amounts[i]);
            unchecked { ++i; }
        }
    }
    
    // ========== СЖИГАНИЕ ТОКЕНОВ ==========
    
    /**
     * @dev Сжигание токенов (публичная функция)
     * @param amount Количество токенов для сжигания
     */
    function burn(uint256 amount) 
        external 
        whenFunctionNotPaused(this.burn.selector) 
        onlyValidAmount(amount) 
    {
        require(balanceOf(msg.sender) >= amount, "Insufficient tokens to burn");
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Сжигание токенов от имени другого пользователя (с разрешением)
     * @param account Адрес владельца токенов
     * @param amount Количество токенов для сжигания
     */
    function burnFrom(address account, uint256 amount) 
        external 
        whenFunctionNotPaused(this.burnFrom.selector) 
        onlyValidAmount(amount) 
    {
        require(account != address(0), "Zero address account");
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Insufficient burn allowance");
        
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }
    
    // ========== УПРАВЛЕНИЕ ПАУЗОЙ ==========
    
    /**
     * @dev Приостановка всего контракта (экстренная остановка)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Возобновление работы контракта
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Селективная пауза отдельных функций
     * @param selector Селектор функции для паузы
     * @param pauseState Состояние паузы (true = пауза, false = активна)
     */
    function pauseFunction(bytes4 selector, bool pauseState) 
        external 
        onlyRole(PAUSER_ROLE) 
    {
        pausedFunctions[selector] = pauseState;
        emit FunctionPauseChanged(selector, pauseState);
    }
    
    // ========== АДМИНИСТРИРОВАНИЕ ==========
    
    /**
     * @dev Обновление адреса treasury
     * @param newTreasury Новый адрес treasury
     */
    function updateTreasury(address newTreasury) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newTreasury != address(0), "Zero treasury address");
        treasury = newTreasury;
    }
    
    /**
     * @dev Обновление конфигурации контракта
     * @param newConfig Новые параметры конфигурации
     */
    function updateConfig(Config calldata newConfig) 
        external 
        onlyRole(OPERATOR_ROLE) 
    {
        require(newConfig.maxSpendingAmount > 0, "Invalid max spending amount");
        require(newConfig.maxLockDuration > 0, "Invalid max lock duration");
        require(newConfig.emergencyUnlockFee <= 1000, "Fee cannot exceed 10%");
        
        config = newConfig;
    }
    
    /**
     * @dev Извлечение заблокированных токенов администратором (экстренная функция)
     * @param to Адрес получателя
     * @param amount Количество токенов
     */
    function emergencyWithdraw(address to, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        whenPaused 
    {
        require(to != address(0), "Zero recipient address");
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        _transfer(address(this), to, amount);
    }
    
    // ========== VIEW ФУНКЦИИ ==========
    
    /**
     * @dev Проверка активной блокировки пользователя
     * @param user Адрес пользователя  
     * @param lockId ID блокировки
     */
    function isLockActive(address user, bytes32 lockId) external view returns (bool) {
        return resourceLocks[user][lockId].isActive;
    }
    
    /**
     * @dev Получение информации о блокировке
     * @param user Адрес пользователя
     * @param lockId ID блокировки
     */
    function getLockInfo(address user, bytes32 lockId) 
        external 
        view 
        returns (uint256 amount, uint256 unlockTime, bytes32 serviceId, bool isActive) 
    {
        ResourceLock memory lock = resourceLocks[user][lockId];
        return (lock.amount, lock.unlockTime, lock.serviceId, lock.isActive);
    }
    
    /**
     * @dev Получение текущей цены CORE через оракул
     */
    function getCurrentCorePrice() external view returns (uint256) {
        return _getValidatedPrice(corePriceFeed);
    }
    
    /**
     * @dev Получение текущей цены USDT через оракул
     */
    function getCurrentUSDTPrice() external view returns (uint256) {
        return _getValidatedPrice(usdtPriceFeed);
    }
    
    // ========== UPGRADE ЛОГИКА ==========
    
    /**
     * @dev Авторизация обновления (UUPS pattern)
     * @param newImplementation Адрес новой имплементации
     */
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(UPGRADER_ROLE) 
    {}
    
    // ========== ПЕРЕОПРЕДЕЛЕННЫЕ ФУНКЦИИ ==========
    
    /**
     * @dev Переопределение transferFrom с проверкой паузы
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Переопределение transfer с проверкой паузы
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }
    
    // ========== ПОДДЕРЖКА ИНТЕРФЕЙСОВ ==========
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

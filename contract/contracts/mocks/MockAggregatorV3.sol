// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/AggregatorV3Interface.sol";

contract MockAggregatorV3 is AggregatorV3Interface {
    int256 private _price;
    uint256 private _updatedAt;
    bool private _staleData;
    
    constructor(int256 initialPrice) {
        _price = initialPrice;
        _updatedAt = block.timestamp;
        _staleData = false;
    }
    
    function setPrice(int256 newPrice) external {
        _price = newPrice;
        _updatedAt = block.timestamp;
    }
    
    function setStaleData(bool stale) external {
        _staleData = stale;
        if (stale) {
            _updatedAt = block.timestamp - 7200; // 2 часа назад
        } else {
            _updatedAt = block.timestamp;
        }
    }
    
    function decimals() external pure override returns (uint8) {
        return 8;
    }
    
    function description() external pure override returns (string memory) {
        return "Mock Price Feed";
    }
    
    function version() external pure override returns (uint256) {
        return 1;
    }
    
    function getRoundData(uint80 _roundId)
        external view override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
        return (_roundId, _price, _updatedAt, _updatedAt, _roundId);
    }
    
    function latestRoundData()
        external view override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
        return (1, _price, _updatedAt, _updatedAt, 1);
    }
}

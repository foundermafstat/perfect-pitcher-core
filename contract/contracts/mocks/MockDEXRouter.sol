// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IDEXRouter.sol";

contract MockDEXRouter is IDEXRouter {
    uint256 private _amountOut;
    
    function setAmountOut(uint256 amount) external {
        _amountOut = amount;
    }
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external override returns (uint[] memory amounts) {
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = _amountOut;
        
        // Простая симуляция свапа
        require(amounts[1] >= amountOutMin, "Insufficient output amount");
        require(deadline >= block.timestamp, "Deadline exceeded");
        
        return amounts;
    }
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view override returns (uint[] memory amounts) {
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = _amountOut;
        return amounts;
    }
    
    function WETH() external pure override returns (address) {
        return address(0);
    }
    
    function factory() external pure override returns (address) {
        return address(0);
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external pure override returns (uint amountA, uint amountB, uint liquidity) {
        return (amountADesired, amountBDesired, amountADesired + amountBDesired);
    }
}

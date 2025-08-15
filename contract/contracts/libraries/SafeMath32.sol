// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SafeMath32
 * @dev Библиотека для безопасной работы с 32-битными числами
 */
library SafeMath32 {
    function add(uint32 a, uint32 b) internal pure returns (uint32) {
        return a + b;
    }
    
    function sub(uint32 a, uint32 b) internal pure returns (uint32) {
        return a - b;
    }
    
    function mul(uint32 a, uint32 b) internal pure returns (uint32) {
        return a * b;
    }
    
    function div(uint32 a, uint32 b) internal pure returns (uint32) {
        require(b > 0, "SafeMath32: division by zero");
        return a / b;
    }
}

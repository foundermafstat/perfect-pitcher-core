// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPerfectPitcherToken {
    function spendOnService(address user, uint256 amount, bytes32 serviceId) external;
    function balanceOf(address account) external view returns (uint256);
}

contract ReentrancyAttacker {
    IPerfectPitcherToken public token;
    bool public attacking = false;
    
    constructor(address _token) {
        token = IPerfectPitcherToken(_token);
    }
    
    function attack() external {
        attacking = true;
        bytes32 serviceId = keccak256("attack");
        token.spendOnService(address(this), 1e18, serviceId);
    }
    
    // Fallback function для попытки reentrancy
    fallback() external {
        if (attacking && token.balanceOf(address(this)) > 0) {
            bytes32 serviceId = keccak256("attack");
            token.spendOnService(address(this), 1e18, serviceId);
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../PerfectPitcherToken.sol";

/**
 * @title Perfect Pitcher Token V2
 * @dev Тестовая версия для проверки upgrade функционала
 */
contract PerfectPitcherTokenV2 is PerfectPitcherToken {
    string public constant version = "2.0.0";
    
    // Новое состояние в V2
    mapping(address => uint256) public rewardsEarned;
    
    /**
     * @dev Новая функция в V2
     */
    function earnRewards(address user, uint256 amount) external onlyRole(OPERATOR_ROLE) {
        rewardsEarned[user] += amount;
    }
    
    /**
     * @dev Получение заработанных наград
     */
    function getRewardsEarned(address user) external view returns (uint256) {
        return rewardsEarned[user];
    }
}

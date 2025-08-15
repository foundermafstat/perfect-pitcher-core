require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

module.exports = {
    networks: {
        hardhat: {
            chainId: 31337,
        },
        coreTestnet: {
            url: "https://rpc.test2.btcs.network",
            chainId: 1114, // Core Testnet2 Chain ID
            accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66 ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 10000000000, // 10 gwei
        },

        // Core Mainnet  
        core: {
            url: "https://rpc.coredao.org",
            chainId: 1116,
            accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66 ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 10000000000, // 10 gwei
        }
    },
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: { 
                enabled: true, 
                runs: 200 
            }
        }
    },
    etherscan: {
        apiKey: {
            core: "abc", // Core не требует API ключ
            coreTestnet: "abc"
        },
        customChains: [
            {
                network: "core",
                chainId: 1116,
                urls: {
                    apiURL: "https://openapi.coredao.org/api",
                    browserURL: "https://scan.coredao.org"
                }
            },
                            {
                    network: "coreTestnet", 
                    chainId: 1114,
                    urls: {
                        apiURL: "https://api.test2.btcs.network/api",
                        browserURL: "https://scan.test2.btcs.network"
                    }
                }
        ]
    },
    gasReporter: {
        enabled: true,
        currency: 'USD',
        gasPrice: 10 // 10 gwei на Core
    }
};
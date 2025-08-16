# Perfect Pitcher Token Integration Guide

## Overview

Successfully integrated the Perfect Pitcher Token (PRFCT) smart contract with the client application, enabling users to swap tCORE tokens for PRFCT tokens on Core Testnet 2.

## What was implemented

### 🔧 Web3 Configuration
- **Updated Wagmi config** for Core Testnet 2 network
- **Contract constants** and ABI definitions
- **Custom hook** for token operations

### 💱 Token Swap Interface
- **Complete swap UI** with input validation
- **Price calculation** using Chainlink oracles
- **Approval workflow** for ERC20 tokens
- **Slippage protection** and transaction monitoring
- **Real-time balance updates**

### 📱 Wallet Integration
- **RainbowKit** wallet connection
- **Network switching** support
- **Balance display** in sidebar
- **Transaction tracking** with explorer links

### 📚 User Experience
- **Step-by-step tutorial** for new users
- **Network configuration** helper
- **Contract information** display
- **Error handling** and user feedback

## Contract Details

### Deployed Addresses (Core Testnet 2)
```
PRFCT Token: 0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A
Treasury:    0x457c3b9703a27c4b2e44c57CAeB2E2a9D4e1ADef
```

### Key Features
- **ERC20 Token** with 18 decimals
- **Total Supply**: 1,000,000,000 PRFCT
- **Swap Route**: tCORE → USDT → PRFCT
- **Treasury Fee**: 1%
- **Oracle Integration**: Chainlink price feeds

## File Structure

```
client/src/
├── lib/
│   ├── contracts/
│   │   └── perfect-pitcher-token.ts    # Contract constants & ABI
│   └── wagmi.ts                        # Updated Web3 config
├── hooks/
│   └── use-perfect-pitcher-token.ts    # Main token operations hook
├── components/
│   ├── token-swap.tsx                  # Swap interface component
│   ├── wallet-balance.tsx              # Balance display component
│   └── token-swap-tutorial.tsx         # User tutorial component
├── app/(app)/
│   └── token-swap/
│       └── page.tsx                    # Swap page with tabs
└── types/
    └── ethereum.d.ts                   # Ethereum window types
```

## Key Components

### 1. usePerfectPitcherToken Hook
```typescript
const {
  balances,           // Core and PRFCT balances
  prices,             // Current token prices
  isApproving,        // Approval transaction status
  isSwapping,         // Swap transaction status
  approveCORE,        // Function to approve CORE tokens
  swapCOREToPRFCT,    // Function to execute swap
  calculateExpectedPRFCT, // Price calculation
  needsApproval,      // Check if approval needed
} = usePerfectPitcherToken()
```

### 2. TokenSwap Component
- Input validation and max amount helper
- Automatic price calculation
- Two-step transaction flow (approve → swap)
- Real-time transaction monitoring
- Network validation

### 3. WalletBalance Component
- Displays tCORE and PRFCT balances
- Shows spending allowance
- Quick access to swap interface
- Network status indicator

## User Flow

1. **Connect Wallet** → RainbowKit connection
2. **Add Network** → Core Testnet 2 configuration
3. **Get tCORE** → From testnet faucet
4. **Approve Tokens** → One-time ERC20 approval
5. **Execute Swap** → tCORE → PRFCT exchange
6. **Use PRFCT** → For AI services and platform features

## Network Configuration

### Core Testnet 2
```json
{
  "chainId": 1114,
  "chainName": "Core Testnet 2",
  "rpcUrls": ["https://rpc.test2.btcs.network"],
  "blockExplorerUrls": ["https://scan.test2.btcs.network"],
  "nativeCurrency": {
    "name": "tCORE",
    "symbol": "tCORE", 
    "decimals": 18
  }
}
```

## Smart Contract Functions Used

### Read Functions
- `balanceOf(address)` - Get PRFCT balance
- `spendingAllowances(address)` - Get spending allowance
- `getCurrentCorePrice()` - Get current CORE price
- `getCurrentUSDTPrice()` - Get current USDT price

### Write Functions
- `swapCOREtoPRFCT(uint256, uint256)` - Execute token swap
- Standard ERC20 approve for CORE tokens

## Error Handling

- **Network Validation** - Ensures Core Testnet 2 connection
- **Balance Checks** - Validates sufficient tCORE balance
- **Approval Workflow** - Automatic approval detection
- **Slippage Protection** - User-configurable slippage tolerance
- **Transaction Monitoring** - Real-time transaction status

## Testing

### Manual Testing Checklist
- [ ] Wallet connection on Core Testnet 2
- [ ] Balance display accuracy
- [ ] Approval transaction execution
- [ ] Swap transaction execution
- [ ] Price calculation accuracy
- [ ] Error handling scenarios
- [ ] Network switching functionality

### Test Scenarios
1. **Fresh wallet** - Complete onboarding flow
2. **Existing user** - Direct swap functionality
3. **Insufficient balance** - Error handling
4. **Wrong network** - Network switching prompt
5. **Transaction failure** - Error recovery

## Future Enhancements

### Planned Features
- **Historical transactions** view
- **Advanced trading features** (limit orders)
- **Liquidity pool information**
- **Yield farming integration**
- **Multi-token support**

### Optimization Opportunities
- **Gas optimization** for contract interactions
- **Caching strategies** for price data
- **Batch operations** for multiple swaps
- **Mobile wallet** integration improvements

## Development Notes

### Dependencies Added
- No new dependencies required
- Uses existing Wagmi v2 + RainbowKit setup
- Leverages shadcn/ui components

### Configuration Updates
- Updated `wagmi.ts` with Core Testnet 2
- Added navigation link for token swap
- Integrated balance display in sidebar

### Security Considerations
- **Slippage protection** prevents MEV attacks
- **Oracle validation** ensures price accuracy
- **Approval limits** for security
- **Network verification** prevents wrong chain transactions

## Support & Troubleshooting

### Common Issues
1. **"Wrong Network"** - Switch to Core Testnet 2
2. **"Insufficient Balance"** - Get tCORE from faucet
3. **"Transaction Failed"** - Check gas fees and try again
4. **"Approval Required"** - Complete approval transaction first

### Getting Help
- Check browser console for detailed errors
- Verify network configuration
- Ensure sufficient gas (tCORE) for transactions
- Use block explorer to track transactions

---

**Perfect Pitcher Token Swap is now live on Core Testnet 2! 🚀**

Users can seamlessly exchange tCORE for PRFCT tokens to access AI-powered services on the platform.


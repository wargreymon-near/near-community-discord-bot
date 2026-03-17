# NEAR Community Discord Bot

A Discord bot for the NEAR ecosystem with price alerts, gas comparison, marketplace notifications, and wallet verification.

## Features

- 💎 **Price Alerts** — Real-time NEAR price tracking with configurable % thresholds
- ⛽ **Gas Comparison** — Compare NEAR gas fees vs Ethereum, Solana, Polygon
- 🏪 **Marketplace Notifications** — Live NFT activity from Paras.id
- ✅ **Wallet Verification** — Verify NEAR wallet ownership, auto-assign roles

## Commands

| Command | Description |
|---------|-------------|
| `/price` | Current NEAR price (USD/BTC/ETH) |
| `/gas` | Gas fee comparison across chains |
| `/stats` | Live NEAR network statistics |
| `/alert set` | Set price alert channel & threshold |
| `/alert remove` | Remove price alerts |
| `/alert status` | View alert configuration |
| `/marketplace recent` | Recent NFT sales on Paras |
| `/marketplace watch` | Enable live NFT notifications |
| `/marketplace unwatch` | Disable NFT notifications |
| `/verify wallet` | Link NEAR wallet to Discord |
| `/verify check` | Check a user's verification |
| `/help` | Show all commands |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DISCORD_TOKEN and CLIENT_ID

# 3. Register slash commands
node deploy-commands.js

# 4. Start the bot
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Your Discord bot token |
| `CLIENT_ID` | Your Discord application ID |
| `NEAR_NETWORK` | `mainnet` or `testnet` (default: mainnet) |

## Adding to Your Server

[![Add to Discord](https://img.shields.io/badge/Add%20to%20Discord-5865F2?style=for-the-badge&logo=discord)](https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268437504&scope=bot%20applications.commands)

## Publishing

Listed on:
- [top.gg](https://top.gg)
- [Discord Bot List](https://discordbotlist.com)

## Built With

- [discord.js v14](https://discord.js.org)
- [CoinGecko API](https://coingecko.com)
- [NEARBlocks API](https://nearblocks.io)
- [Paras.id API](https://paras.id)
- [NEAR RPC](https://rpc.mainnet.near.org)

# 🌎 Artesanía Viajera | Autonomous ReFi Agent

**Artesanía Viajera** is a Regenerative Finance (ReFi) DApp deployed on the Celo Mainnet. It connects global travelers with local artisans in Colombia by abstracting Web3 complexities through an Autonomous AI Agent. Every tourist purchase automatically funds Universal Basic Income (UBI) pools, proving that everyday commerce can sustainably fund public goods.

---

## 🚀 Key Features

### 🤖 1. Autonomous AI Agent (ERC-8004 Compliant)
We built an intelligent agent ("CAJERO") that handles the entire payment flow for tourists. Instead of dealing with complex crypto transactions, users simply chat with the agent to purchase a local craft.
- **Agent Wallet (EOA):** The agent operates its own dedicated wallet, paying for gas and signing transactions autonomously.
- **Dynamic Reputation:** Compliant with Celo's ERC-8004 standard. Upon every successful payment routing, the agent automatically triggers an on-chain 5-star feedback (`giveFeedback`), building its reputation dynamically on the `8004scan` registry.

### 💸 2. ReFi Payment Splitter
Our custom smart contract logic acts as a financial routing engine. When the AI Agent processes a payment (in `$CELO` or `$USDT`), the funds are instantly trustlessly split:
- **90%** ➡️ Direct to the Artisan.
- **5%** ➡️ DApp Treasury for sustainability.
- **2.5%** ➡️ **GoodDollar UBI Pool** (Activity-based fee).
- **2.5%** ➡️ Local Artesanía Impact Pool.

### 💧 3. GoodDollar & Superfluid Integration
We shift UBI funding from a "donation" model to an "activity-based" model. By integrating **GoodDollar ($G$)**, every craft sold generates micro-fees that flow directly into UBI pools. 
- **Future Growth (Season 4):** We are integrating **Superfluid** streaming capabilities to continuously stream $G$ rewards to artisans based on their sales volume, creating a sustained incentive loop.

### 🟡 4. Built on Celo
Celo's mobile-first, low-cost, and carbon-negative infrastructure makes micro-transactions possible. Our DApp leverages Celo to ensure that tourists and artisans don't lose their earnings to gas fees.

---

## 🏗️ Architecture & Flow

1. **User (Tourist)** selects a craft and chats with the AI Agent.
2. **AI Agent (CAJERO)** calculates the splits and signs the transaction using its autonomous wallet.
3. **Blockchain (Celo Mainnet)** processes the transaction, routing `$CELO`/`$USDT` to the Artisan and the GoodDollar UBI Pool.
4. **Reputation Registry (ERC-8004)** receives an automated 5-star rating, updating the agent's score on `8004scan`.
5. **Reward (ERC-1155/ERC-721)**: The tourist receives an "Artesanía Badge" or "Passport" NFT as proof of their regenerative impact.

---

## 🔗 Deployed Contracts (Celo Mainnet)

| Contract / Tool | Address / Link |
| :--- | :--- |
| **ReFi Splitter (Core)** | `0xa08e6C51f0210AbB944A589fc7CFB054cB43fbf0` |
| **Artesanía Passport (ERC-721)** | `0xF62d9Ed4243c08C0191C62ac5dA9F77abC7559b5` |
| **Artesanía Badge (ERC-1155)** | `0x77fb775be55fdfae9ed98c82665f1ab1bf19de7d` |
| **AI Agent Profile (ERC-8004)** | [Agent 9059 on 8004scan](https://8004scan.io/agents/celo/9059) |
| **Agent Wallet Activity** | [View on CeloScan](https://celoscan.io/address/0xD9c10131d92f50335569a48A4b58d74f1865Da01) |

---

## 🏆 Hackathon & Programs Context

This repository is actively submitted and built for:
- **Celo Agent Hackathon (2026):** Showcasing a fully operational on-chain agent that builds its own reputation (ERC-8004) and executes real ReFi transactions.
- **GoodBuilders Season 4:** Focused on Growth and Adoption, demonstrating how activity-based fees can sustainably fund the GoodDollar UBI ecosystem.

---

## 💻 Tech Stack
- **Frontend:** Next.js, React, TailwindCSS
- **Web3 & Auth:** Wagmi, Viem, Privy
- **Blockchain:** Celo Mainnet, Solidity, Hardhat
- **Agent Tooling:** ERC-8004 Registries, Ethers.js
- **Impact Ecosystem:** GoodDollar, Superfluid

---
*Built with ❤️ in Colombia for the world.*

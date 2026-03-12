# 🚀 Lazy Verifier (`verify-me`)

A blazing-fast Smart Contract Verification CLI for Node.js, powered by `lazy-rpc`.

Have you ever just wanted to verify a single Solidity file without spinning up a full Hardhat or Foundry environment? **Lazy Verifier** (via the `verify-me` command) is a standalone "Swiss Army Knife" for developers who want to skip the configuration files and just verify.

## ✨ Features

- **Lazy RPC Integration**: Powered by `lazy-rpc` to automatically grab the fastest, most reliable public RPCs for any given Chain ID without manual configuration.
- **Regex-Based Flattening Engine**: Traverses standard local imports and `node_modules/` using simple regex string matching rather than a complex AST parser, bundling everything into `Standard JSON Input` format.
- **CBOR Bytecode Analysis**: Deep-inspects on-chain bytecode and decodes trailing CBOR metadata blocks directly from hex to extract the matching compiler version.
- **Semi-Automated Heuristics Engine**: If direct verification fails with the default optimizer settings, it will lazily brute-force optimizer `runs` (200, 10000, 999999, 1) and EVM targets (paris, shanghai, london, cancun, etc.) until the block explorers accept the match.
- **Multi-Explorer Broadcasts**: Submits your contract source simultaneously to **Sourcify** (Verifier Alliance) and **Etherscan V2** block explorers.
- **Proxy Detection & Basic Security Checks**: Optionally supply the `--verify-proxy` flag to natively resolve standard EIP-1967 or EIP-1167 proxy implementations. Integrates locally with `slither` for a quick pre-flight security scan.

## 📦 Usage

### Basic Verification
Provides just the essentials: Contract Address, Chain ID, and your main smart contract file path.

```bash
npx verify-me --address 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 --chain 1 --contract ./src/MyToken.sol
```

### Advanced Overrides & Proxies
If the heuristic engine fails or you're missing CBOR metadata, manually override the `solc` compiler. If it's a proxy, let the tool resolve the underlying address automatically.

```bash
npx verify-me -a 0xProxyAddress -c 11155111 -f ./src/Logic.sol -v 0.8.20 --verify-proxy
```

## 🛠️ Options

| Flag | Long Form | Description |
| :--- | :--- | :--- |
| `-a` | `--address` | The deployed contract address (`0x...`) |
| `-c` | `--chain` | The chain ID where the contract is deployed (e.g., `1`, `137`) |
| `-f` | `--contract` | Path to the main Solidity source file |
| `-v` | `--compiler-version` | *(Optional)* Override compiler version if auto-detection fails |
| `-p` | `--verify-proxy` | *(Optional)* Inspects storage slots to resolve implementation addresses behind proxies |
| `-k` | `--etherscan-api-key`| *(Optional)* API Key if using Etherscan (Sourcify requires none) |
| `-h` | `--help` | Display the CLI help manual |

## 🚀 Building locally

```bash
npm install
npm run build

# Direct execution
node dist/cli.js --help
```

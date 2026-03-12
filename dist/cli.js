#!/usr/bin/env node
import { parseArgs } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { EthRPC } from './rpc.js';
import { extractCompilerVersion } from './bytecode.js';
import { detectImplementation } from './proxy.js';
import { buildStandardJson } from './flattener.js';
import { runPreflightScan } from './scanner.js';
import { SourcifyVerifier, EtherscanVerifier } from './verifier.js';
import { heuristicVerification } from './heuristics.js';
const argsOptions = {
    address: { type: 'string', short: 'a' },
    chain: { type: 'string', short: 'c' },
    contract: { type: 'string', short: 'f' },
    'compiler-version': { type: 'string', short: 'v' },
    'verify-proxy': { type: 'boolean', short: 'p', default: false },
    'etherscan-api-key': { type: 'string', short: 'k' },
    help: { type: 'boolean', short: 'h', default: false }
};
function printHelp() {
    console.log(`
Usage: verify-me [options]

Options:
  -a, --address            The deployed contract address (0x...)
  -c, --chain              The chain ID where the contract is deployed (e.g., 1, 11155111)
  -f, --contract           Path to the main Solidity source file (e.g., ./src/MyToken.sol)
  -v, --compiler-version   (Optional) Override compiler version if auto-detection fails (e.g., 0.8.20)
  -p, --verify-proxy       Verify both the proxy and the underlying implementation behind it
  -k, --etherscan-api-key  (Optional) Etherscan API Key for block explorer verification
  -h, --help               Display this help message

Example:
  npx verify-me --address 0x123... --chain 1 --contract ./src/MyToken.sol -p
`);
}
async function main() {
    let parsed;
    try {
        parsed = parseArgs({ options: argsOptions, allowPositionals: false });
    }
    catch (err) {
        console.error(`\x1b[31mError parsing arguments:\x1b[0m ${err.message}`);
        printHelp();
        process.exit(1);
    }
    const { values } = parsed;
    if (values.help) {
        printHelp();
        return;
    }
    if (!values.address || !values.chain || !values.contract) {
        console.error('\x1b[31mError:\x1b[0m Missing required arguments: --address, --chain, or --contract\n');
        printHelp();
        process.exit(1);
    }
    const address = values.address;
    const chainId = parseInt(values.chain, 10);
    const contractAbsPath = path.resolve(values.contract);
    const manualCompilerOverride = values['compiler-version'];
    const verifyProxy = values['verify-proxy'];
    const etherscanKey = values['etherscan-api-key'];
    const contractName = path.basename(contractAbsPath, '.sol');
    // Just use filename as virtual path key for Standard JSON
    const virtualPath = path.basename(contractAbsPath);
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        console.error('\x1b[31mError:\x1b[0m Invalid contract address format');
        process.exit(1);
    }
    if (!fs.existsSync(contractAbsPath)) {
        console.error(`\x1b[31mError:\x1b[0m Contract file not found: ${contractAbsPath}`);
        process.exit(1);
    }
    console.log(`\x1b[36m🚀  Verify-Me (Zero-Config)\x1b[0m started.`);
    // 1. Pre-Flight Scan
    console.log(`\n\x1b[2m--- PRE-FLIGHT ---\x1b[0m`);
    runPreflightScan(contractAbsPath); // Non-blocking
    // 2. Fetch Bytecode
    console.log(`\n\x1b[2m--- CHAIN ANALYSIS ---\x1b[0m`);
    console.log(`Connecting to Blockchain (Chain ID: ${chainId}) via zero-config RPC...`);
    const rpc = new EthRPC(chainId);
    let bytecode;
    try {
        bytecode = await rpc.getCode(address);
        console.log(`✅  Successfully fetched deployed bytecode.`);
    }
    catch (e) {
        console.error(`\x1b[31mFailed to fetch bytecode:\x1b[0m ${e.message}`);
        process.exit(1);
    }
    let finalAddressToVerify = address;
    // 3. Proxy Detection
    if (verifyProxy) {
        console.log(`🔎  Detecting proxy pattern...`);
        const proxyCheck = await detectImplementation(rpc, address, bytecode);
        if (proxyCheck.isProxy && proxyCheck.implementationAddress) {
            console.log(`✅  Proxy detected (${proxyCheck.proxyType})! Underlying implementation: \x1b[33m${proxyCheck.implementationAddress}\x1b[0m`);
            finalAddressToVerify = proxyCheck.implementationAddress;
            // Refetch implementation bytecode
            bytecode = await rpc.getCode(finalAddressToVerify);
            console.log(`✅  Fetched underlying implementation bytecode.`);
        }
        else {
            console.log(`⚠️  No standard proxy pattern detected or implemented slot is empty. Verifying as normal contract.`);
        }
    }
    // 4. Compiler Version Auto-Detection
    let targetSolcVersion = manualCompilerOverride;
    if (!targetSolcVersion) {
        console.log(`🔎  Extracting compiler version from CBOR metadata...`);
        const { solcVersion, hasCbor } = extractCompilerVersion(bytecode);
        if (!solcVersion) {
            if (hasCbor) {
                console.error(`\x1b[31mCBOR parsed but solc version not found.\x1b[0m You must supply the version manually via --compiler-version.`);
                process.exit(1);
            }
            else {
                console.error(`\x1b[31mNo CBOR metadata found in bytecode.\x1b[0m Was this contract compiled with metadata stripped? Use --compiler-version to override.`);
                process.exit(1);
            }
        }
        targetSolcVersion = solcVersion;
        console.log(`✅  Compiler variation detected: \x1b[32m${targetSolcVersion}\x1b[0m`);
    }
    else {
        console.log(`✅  Using manual compiler override: \x1b[32m${targetSolcVersion}\x1b[0m`);
    }
    // 5. Build Standard JSON Input
    console.log(`\n\x1b[2m--- CODE FLATTENING ---\x1b[0m`);
    console.log(`📦  Building Standard JSON for \x1b[33m${virtualPath}\x1b[0m...`);
    let standardJson;
    try {
        standardJson = buildStandardJson(contractAbsPath, virtualPath, 200, 'paris');
        console.log(`✅  Flattened ${Object.keys(standardJson.sources).length} dependencies into Standard JSON!`);
    }
    catch (e) {
        console.error(`\x1b[31mFailed trying to flatten the source:\x1b[0m ${e.message}`);
        process.exit(1);
    }
    // 6. Broadcast Verification via Heuristics
    console.log(`\n\x1b[2m--- BROADCAST & VERIFICATION ---\x1b[0m`);
    const providers = [
        new SourcifyVerifier(),
        new EtherscanVerifier(etherscanKey)
    ];
    await Promise.all(providers.map(async (provider) => {
        console.log(`🚀  Submitting to ${provider.name}...`);
        try {
            const hResult = await heuristicVerification(provider, finalAddressToVerify, chainId, targetSolcVersion, standardJson, contractName);
            if (hResult.success) {
                let msg = `🎉  \x1b[32mVerification Success on ${provider.name}!\x1b[0m`;
                if (hResult.successfulRuns !== 200 || hResult.successfulEvm !== 'paris') {
                    msg += ` (Heuristic matched: Runs=${hResult.successfulRuns}, EVM=${hResult.successfulEvm})`;
                }
                if (typeof hResult.providerResult === 'string') {
                    msg += ` => ${hResult.providerResult}`;
                }
                console.log(msg);
            }
            else {
                console.log(`❌  \x1b[31mVerification Failed on ${provider.name}:\x1b[0m ${hResult.providerResult}`);
            }
        }
        catch (e) {
            console.log(`❌  \x1b[31mError submitting to ${provider.name}:\x1b[0m ${e.message}`);
        }
    }));
    console.log(`\n\x1b[36mVerify-Me Pipeline Completed.\x1b[0m`);
}
main().catch(e => {
    console.error('\x1b[31mFatal System Error:\x1b[0m ', e);
    process.exit(1);
});

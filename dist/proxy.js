// EIP-1967 Implementation Slot
const EIP1967_IMPL_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
// EIP-1167 Minimal Proxy Magic Prefix
const EIP1167_PREFIX = '363d3d373d3d3d363d73';
/**
 * Strips left padding of an Ethereum address returned from a storage slot.
 */
function stripPadding(storageVal) {
    if (!storageVal || storageVal === '0x' || storageVal === '0x0')
        return '0x';
    const clean = storageVal.replace('0x', '');
    return '0x' + clean.slice(-40); // Last 40 chars = 20-byte address
}
export async function detectImplementation(rpc, proxyAddress, bytecode) {
    const cleanCode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
    // 1. Check EIP-1167 Minimal Proxy (Forwarder)
    // Bytecode looks like 363d3d373d3d3d363d73 <20_bytes_addr> 5af43d82803e903d91602b57fd5bf3
    if (cleanCode.startsWith(EIP1167_PREFIX)) {
        const implAddr = '0x' + cleanCode.slice(EIP1167_PREFIX.length, EIP1167_PREFIX.length + 40);
        return {
            isProxy: true,
            implementationAddress: implAddr.toLowerCase(),
            proxyType: 'EIP-1167'
        };
    }
    // 2. Check EIP-1967 standard (Transparent / UUPS)
    // By querying the standardized slot for the implementation address
    const storageVal = await rpc.getStorageAt(proxyAddress, EIP1967_IMPL_SLOT);
    if (storageVal && storageVal !== '0x' && storageVal !== '0x0' && parseIntStrict(storageVal) !== 0n) {
        const implAddr = stripPadding(storageVal).toLowerCase();
        if (implAddr !== '0x' && implAddr.length === 42) {
            return {
                isProxy: true,
                implementationAddress: implAddr,
                proxyType: 'EIP-1967'
            };
        }
    }
    return {
        isProxy: false,
        implementationAddress: null,
        proxyType: null
    };
}
// Safe BigInt parsing for strict non-zero validation
function parseIntStrict(val) {
    try {
        return BigInt(val);
    }
    catch {
        return 0n;
    }
}

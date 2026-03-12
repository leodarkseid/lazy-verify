const COMMON_RUNS = [200, 10000, 999999, 1];
const COMMON_EVM_VERSIONS = ['paris', 'shanghai', 'london', 'cancun', 'berlin', 'istanbul'];
export async function heuristicVerification(provider, address, chainId, compilerVersion, baseStandardJson, contractName) {
    // First try the configured/default setup
    let result = await provider.verify(address, chainId, compilerVersion, baseStandardJson, contractName);
    // If success (true or guid string), return early
    if (result === true || (typeof result === 'string' && result.startsWith('Subm'))) {
        return {
            success: true,
            successfulRuns: baseStandardJson.settings.optimizer.runs,
            successfulEvm: baseStandardJson.settings.evmVersion,
            providerResult: result
        };
    }
    console.log(`\x1b[33mInitial verification via ${provider.name} failed. Starting Heuristics Engine...\x1b[0m`);
    // Try different optimization runs
    for (const r of COMMON_RUNS) {
        if (r === baseStandardJson.settings.optimizer.runs)
            continue; // Skip default that failed
        console.log(`[Heuristic] Trying runs: ${r}...`);
        // Deep clone to mutate safely
        const variantJson = JSON.parse(JSON.stringify(baseStandardJson));
        variantJson.settings.optimizer.runs = r;
        result = await provider.verify(address, chainId, compilerVersion, variantJson, contractName);
        if (result === true || (typeof result === 'string' && result.startsWith('Subm'))) {
            return { success: true, successfulRuns: r, successfulEvm: variantJson.settings.evmVersion, providerResult: result };
        }
    }
    // Try different EVM versions
    for (const evm of COMMON_EVM_VERSIONS) {
        if (evm === baseStandardJson.settings.evmVersion)
            continue;
        console.log(`[Heuristic] Trying EVM version: ${evm}...`);
        const variantJson = JSON.parse(JSON.stringify(baseStandardJson));
        variantJson.settings.evmVersion = evm;
        result = await provider.verify(address, chainId, compilerVersion, variantJson, contractName);
        if (result === true || (typeof result === 'string' && result.startsWith('Subm'))) {
            return { success: true, successfulRuns: variantJson.settings.optimizer.runs, successfulEvm: evm, providerResult: result };
        }
    }
    // Combinations (Runs + EVMs) for extreme cases could go here
    // For now, if we exhausted the 1D search space, return failure
    return {
        success: false,
        providerResult: result
    };
}

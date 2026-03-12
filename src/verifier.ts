import { buildStandardJson, StandardJsonInput } from './flattener.js';

/**
 * Interface for any Verifier Provider (Sourcify, Etherscan, etc)
 */
export interface VerificationProvider {
    name: string;
    verify(
        address: string,
        chainId: number,
        compilerVersion: string,
        standardJson: StandardJsonInput,
        contractName: string
    ): Promise<boolean | string>;
}

/**
 * Verifies on Sourcify which syncs with the Verifier Alliance.
 * Very clean Standard JSON Input compatibility.
 */
export class SourcifyVerifier implements VerificationProvider {
    name = 'Sourcify';

    async verify(
        address: string,
        chainId: number,
        compilerVersion: string,
        standardJson: StandardJsonInput,
        contractName: string
    ): Promise<boolean | string> {
        try {
            const response = await fetch('https://sourcify.dev/server/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    chain: chainId.toString(),
                    files: {
                        'metadata.json': JSON.stringify(standardJson),
                        // Sourcify can also take individual sources, but Standard JSON is robust
                    },
                    chosenContract: contractName
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            return data.result?.[0]?.status === 'perfect' || data.result?.[0]?.status === 'partial';
        } catch (e) {
            return `Sourcify Error: ${(e as Error).message}`;
        }
    }
}

/**
 * Modern Etherscan API V2 uses a single endpoint for all chains
 * while relying on a `chainid` query parameter for routing.
 * https://docs.etherscan.io/v2-migration
 */
const ETHERSCAN_V2_URL = 'https://api.etherscan.io/v2/api';

export class EtherscanVerifier implements VerificationProvider {
    name = 'Etherscan (and variants)';

    constructor(private apiKey?: string) { }

    async verify(
        address: string,
        chainId: number,
        compilerVersion: string,
        standardJson: StandardJsonInput,
        contractName: string
    ): Promise<boolean | string> {
        const solcVer = compilerVersion.startsWith('v') ? compilerVersion : `v${compilerVersion}`;

        // Convert standard JSON to string for the API
        const standardJsonStr = JSON.stringify(standardJson);

        try {
            const body = new URLSearchParams({
                apikey: this.apiKey || '',
                chainid: chainId.toString(),
                module: 'contract',
                action: 'verifysourcecode',
                contractaddress: address,
                sourceCode: standardJsonStr,
                codeformat: 'solidity-standard-json-input',
                contractname: contractName,
                compilerversion: solcVer,
            });

            const response = await fetch(ETHERSCAN_V2_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString()
            });

            const data = await response.json();

            // Typical Etherscan response matches `1` for OK
            if (data.status === '1') {
                const guid = data.result;
                // Ideally we would poll `checkverifystatus` with the guid, but returning guid gives proof of submission
                return `Submitted! GUID: ${guid}`;
            } else {
                throw new Error(data.result || data.message);
            }
        } catch (e) {
            return `Etherscan Error: ${(e as Error).message}`;
        }
    }
}

/**
 * Universal broadcast functionality
 */
export async function broadcastVerification(
    address: string,
    chainId: number,
    compilerVersion: string,
    standardJson: StandardJsonInput,
    contractName: string,
    etherscanApiKey?: string
): Promise<Record<string, string | boolean>> {
    const providers: VerificationProvider[] = [
        new SourcifyVerifier(),
        new EtherscanVerifier(etherscanApiKey)
    ];

    const results: Record<string, string | boolean> = {};

    await Promise.all(
        providers.map(async (provider) => {
            const result = await provider.verify(
                address,
                chainId,
                compilerVersion,
                standardJson,
                contractName
            );
            results[provider.name] = result;
        })
    );

    return results;
}

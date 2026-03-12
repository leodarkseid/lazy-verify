import { StandardJsonInput } from './flattener.js';
/**
 * Interface for any Verifier Provider (Sourcify, Etherscan, etc)
 */
export interface VerificationProvider {
    name: string;
    verify(address: string, chainId: number, compilerVersion: string, standardJson: StandardJsonInput, contractName: string): Promise<boolean | string>;
}
/**
 * Verifies on Sourcify which syncs with the Verifier Alliance.
 * Very clean Standard JSON Input compatibility.
 */
export declare class SourcifyVerifier implements VerificationProvider {
    name: string;
    verify(address: string, chainId: number, compilerVersion: string, standardJson: StandardJsonInput, contractName: string): Promise<boolean | string>;
}
export declare class EtherscanVerifier implements VerificationProvider {
    private apiKey?;
    name: string;
    constructor(apiKey?: string | undefined);
    verify(address: string, chainId: number, compilerVersion: string, standardJson: StandardJsonInput, contractName: string): Promise<boolean | string>;
}
/**
 * Universal broadcast functionality
 */
export declare function broadcastVerification(address: string, chainId: number, compilerVersion: string, standardJson: StandardJsonInput, contractName: string, etherscanApiKey?: string): Promise<Record<string, string | boolean>>;

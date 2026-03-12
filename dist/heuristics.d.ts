import { StandardJsonInput } from './flattener.js';
import { VerificationProvider } from './verifier.js';
interface HeuristicsResult {
    success: boolean;
    successfulRuns?: number;
    successfulEvm?: string;
    providerResult?: string | boolean;
}
export declare function heuristicVerification(provider: VerificationProvider, address: string, chainId: number, compilerVersion: string, baseStandardJson: StandardJsonInput, contractName: string): Promise<HeuristicsResult>;
export {};

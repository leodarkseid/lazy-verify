import { EthRPC } from './rpc.js';
export interface ProxyDetectionResult {
    isProxy: boolean;
    implementationAddress: string | null;
    proxyType: 'EIP-1967' | 'EIP-1167' | 'Unknown' | null;
}
export declare function detectImplementation(rpc: EthRPC, proxyAddress: string, bytecode: string): Promise<ProxyDetectionResult>;

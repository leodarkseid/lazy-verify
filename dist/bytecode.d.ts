export interface ContractMetadata {
    solcVersion: string | null;
    hasCbor: boolean;
}
/**
 * Extracts the solc compiler version directly from the CBOR metadata
 * embedded at the end of Solidity bytecode without needing a CBOR library.
 */
export declare function extractCompilerVersion(bytecode: string): ContractMetadata;

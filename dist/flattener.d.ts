export interface StandardJsonInput {
    language: 'Solidity';
    sources: Record<string, {
        content: string;
    }>;
    settings: {
        optimizer: {
            enabled: boolean;
            runs: number;
        };
        evmVersion?: string;
    };
}
/**
 * Recursively parses the contract and its imports to build the sources mapping correctly.
 */
export declare function buildStandardJson(entryFileAbsolute: string, // /abs/path/to/MyToken.sol
entryFileVirtual: string, // "src/MyToken.sol"
runs?: number, evmVersion?: string): StandardJsonInput;

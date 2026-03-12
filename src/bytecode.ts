export interface ContractMetadata {
    solcVersion: string | null;
    hasCbor: boolean;
}

/**
 * Extracts the solc compiler version directly from the CBOR metadata 
 * embedded at the end of Solidity bytecode without needing a CBOR library.
 */
export function extractCompilerVersion(bytecode: string): ContractMetadata {
    const cleanCode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
    if (cleanCode.length < 4) {
        return { solcVersion: null, hasCbor: false };
    }

    // The last 2 bytes (4 hex chars) represent the CBOR metadata length
    const lengthHex = cleanCode.slice(-4);
    const cborLength = parseInt(lengthHex, 16);

    // If the metadata length exceeds the bytecode length or is 0, no valid CBOR
    if (isNaN(cborLength) || cborLength === 0 || cborLength * 2 > cleanCode.length) {
        return { solcVersion: null, hasCbor: false };
    }

    const cborHex = cleanCode.slice(-(cborLength * 2 + 4), -4);

    // Solidity encodes the compiler version as "solc" followed by a 3-byte array
    // In Hex CBOR: 'solc' is 64 73 6f 6c 63. The byte array marker is 43 (for 3 bytes)
    // Therefore the magic sequence is '64736f6c6343' followed by 6 hex chars (3 bytes).
    const magicSequence = '64736f6c6343';
    const index = cborHex.indexOf(magicSequence);

    if (index !== -1) {
        const versionHex = cborHex.slice(index + magicSequence.length, index + magicSequence.length + 6);
        if (versionHex.length === 6) {
            const major = parseInt(versionHex.slice(0, 2), 16);
            const minor = parseInt(versionHex.slice(2, 4), 16);
            const patch = parseInt(versionHex.slice(4, 6), 16);
            return { solcVersion: `0.${minor}.${patch}`, hasCbor: true };
        }
    }

    // Fallback for pre-0.5.9 versions or alternative encodings
    // Often solc injects its version near the end in plaintext hex, e.g., '0.4.18' could be embedded.
    // We can regex look for standard solc SemVer tags in hex (e.g. 0.x.y or 0.x.y+commit.abcd)
    // Let's search the last 200 bytes for '0.'
    const recent = cleanCode.slice(-400);
    const versionRegex = /(?:v)?(0\.[0-9]+\.[0-9]+(?:\+commit\.[a-fA-F0-9]+)?)/g;

    // Convert hex to ascii string for easier regex fallback extraction
    let ascii = '';
    for (let i = 0; i < recent.length; i += 2) {
        ascii += String.fromCharCode(parseInt(recent.slice(i, i + 2), 16));
    }

    let match;
    let lastMatch = null;
    while ((match = versionRegex.exec(ascii)) !== null) {
        lastMatch = match[1];
    }

    if (lastMatch) {
        // Return the latest match
        return { solcVersion: lastMatch, hasCbor: !!cborHex };
    }

    return { solcVersion: null, hasCbor: !!cborHex };
}

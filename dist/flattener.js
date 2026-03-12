import fs from 'node:fs';
import path from 'node:path';
// Matches static solidity imports, e.g. import "./file.sol"; import { A } from "./a.sol"; import "@openzeppelin/...";
const IMPORT_REGEX = /import\s+(?:(?:(?:\{[^}]+\})|(?:[*]\s+as\s+\w+)|(?:\w+))\s+from\s+)?(?:'|")([^'"]+)(?:'|");/g;
/**
 * Resolves an import path to an absolute system path.
 * Tries relative paths first, then falls back to node_modules lookup.
 */
function resolveImportPath(importPath, currentFileAbsPath) {
    const isRelative = importPath.startsWith('.') || importPath.startsWith('..');
    if (isRelative) {
        const dir = path.dirname(currentFileAbsPath);
        const resolved = path.resolve(dir, importPath);
        if (fs.existsSync(resolved))
            return resolved;
    }
    // Not relative or relative failed, check node_modules in the root workspace
    // Ascend directories from the current file looking for node_modules/`importPath`
    let currentDir = path.dirname(currentFileAbsPath);
    while (currentDir !== '/' && currentDir !== path.parse(currentDir).root) {
        const checkPath = path.join(currentDir, 'node_modules', importPath);
        if (fs.existsSync(checkPath)) {
            return checkPath;
        }
        currentDir = path.dirname(currentDir);
    }
    // Fallback to searching process.cwd() node_modules
    const cwdNodeModules = path.join(process.cwd(), 'node_modules', importPath);
    if (fs.existsSync(cwdNodeModules))
        return cwdNodeModules;
    throw new Error(`Cannot resolve import "${importPath}" from ${currentFileAbsPath}`);
}
/**
 * Recursively parses the contract and its imports to build the sources mapping correctly.
 */
export function buildStandardJson(entryFileAbsolute, // /abs/path/to/MyToken.sol
entryFileVirtual, // "src/MyToken.sol"
runs = 200, evmVersion = 'paris') {
    const sources = {};
    const visited = new Set();
    function walk(fileAbs, fileVirtual) {
        if (visited.has(fileAbs))
            return;
        visited.add(fileAbs);
        if (!fs.existsSync(fileAbs)) {
            throw new Error(`File not found: ${fileAbs}`);
        }
        const content = fs.readFileSync(fileAbs, 'utf8');
        sources[fileVirtual] = { content };
        // Extract imports and recurse
        let match;
        const regex = new RegExp(IMPORT_REGEX);
        while ((match = regex.exec(content)) !== null) {
            const importPath = match[1];
            const resolvedAbsPath = resolveImportPath(importPath, fileAbs);
            // Keep node_module paths as @org/pkg/file in the virtual view, matching exact import
            // If it's relative, we need to compute its virtual path cleanly relative to the current virtual path.
            let nextVirtualPath = importPath;
            if (importPath.startsWith('.')) {
                nextVirtualPath = path.posix.join(path.posix.dirname(fileVirtual), importPath);
                // normalize "src/../contracts/A.sol" to "contracts/A.sol"
                nextVirtualPath = path.posix.normalize(nextVirtualPath);
            }
            walk(resolvedAbsPath, nextVirtualPath);
        }
    }
    walk(entryFileAbsolute, entryFileVirtual);
    return {
        language: 'Solidity',
        sources,
        settings: {
            optimizer: {
                enabled: runs > 0,
                runs: runs > 0 ? runs : 200
            },
            evmVersion
        }
    };
}

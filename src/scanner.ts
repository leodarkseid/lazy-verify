import { execSync } from 'node:child_process';
import path from 'node:path';

/**
 * Checks if a command exists in the local PATH
 */
function hasCommand(cmd: string): boolean {
    try {
        execSync(`command -v ${cmd}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Runs a pre-flight scan using Slither if installed.
 * Returns true if the user should be warned.
 */
export function runPreflightScan(contractPath: string): boolean {
    if (hasCommand('slither')) {
        console.log(`\x1b[36m[Pre-Flight]\x1b[0m Slither detected. Running static analysis on ${path.basename(contractPath)}...`);
        try {
            // Run slither strictly looking for High/Medium impact issues
            const output = execSync(`slither ${contractPath} --json -`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });

            const parsed = JSON.parse(output);
            const issues = parsed.results?.detectors || [];
            const criticalOrHigh = issues.filter((i: any) => i.impact === 'High' || i.impact === 'Medium');

            if (criticalOrHigh.length > 0) {
                console.warn(`\x1b[31m[WARNING] Pre-flight scan detected ${criticalOrHigh.length} severe issues!\x1b[0m`);
                return true;
            }

            console.log(`\x1b[32m[Pre-Flight]\x1b[0m No severe issues found. Coast is clear!`);
            return false;
        } catch (e) {
            // Slither returns non-zero exit code if vulnerabilities are found
            // We don't want to break the pipeline, just warn the user.
            const stdout = (e as any).stdout;
            if (stdout) {
                try {
                    const parsed = JSON.parse(stdout);
                    const issues = parsed.results?.detectors || [];
                    const criticalOrHigh = issues.filter((i: any) => i.impact === 'High' || i.impact === 'Medium');

                    if (criticalOrHigh.length > 0) {
                        console.warn(`\x1b[31m[WARNING] Pre-flight scan detected ${criticalOrHigh.length} severe issues!\x1b[0m`);
                        return true;
                    }
                } catch {
                    // failed parsing
                    console.warn(`\x1b[33m[Pre-Flight]\x1b[0m Slither encountered an issue analyzing the contract. Proceeding anyway.`);
                }
            }
            return false;
        }
    }

    // If we had aderyn logic it would go here
    if (hasCommand('aderyn')) {
        console.log(`\x1b[36m[Pre-Flight]\x1b[0m Aderyn detected. (Feature pending integration).`);
    }

    return false; // Coast is clear / no tools found
}

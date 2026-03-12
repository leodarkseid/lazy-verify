import * as https from 'node:https';
import { RPC } from 'lazy-rpc';
export class EthRPC {
    rpcManager;
    constructor(chainId) {
        this.rpcManager = new RPC({
            chainId: '0x' + chainId.toString(16).padStart(4, '0'),
            log: false
        });
    }
    async call(method, params) {
        let lastError = null;
        let retries = 5;
        while (retries > 0) {
            let url;
            try {
                // Get verified fast RPC from lazy-rpc
                url = await this.rpcManager.getRpcAsync('https');
                console.log(`\x1b[36m[RPC] Using RPC endpoint: ${url}\x1b[0m`);
            }
            catch (err) {
                throw new Error(`RPC manager failed to provide endpoint: ${err.message}`);
            }
            try {
                const data = await new Promise((resolve, reject) => {
                    const parsedUrl = new URL(url);
                    const postData = JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method,
                        params,
                    });
                    const options = {
                        hostname: parsedUrl.hostname,
                        port: parsedUrl.port || 443,
                        path: parsedUrl.pathname,
                        method: 'POST',
                        family: 4, // Force IPv4 to avoid dev container timeout loops
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(postData)
                        },
                        timeout: 5000
                    };
                    const req = https.request(options, (res) => {
                        let rawData = '';
                        res.setEncoding('utf8');
                        res.on('data', (chunk) => { rawData += chunk; });
                        res.on('end', () => {
                            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                                reject(new Error(`HTTP Error: ${res.statusCode} from ${url}`));
                                return;
                            }
                            try {
                                const parsedData = JSON.parse(rawData);
                                resolve(parsedData);
                            }
                            catch (e) {
                                reject(new Error(`JSON Parse Error: ${e.message}`));
                            }
                        });
                    });
                    req.on('timeout', () => {
                        req.destroy();
                        reject(new Error(`Timeout from ${url}`));
                    });
                    req.on('error', (e) => {
                        reject(new Error(`HTTPS Error: ${e.message}`));
                    });
                    req.write(postData);
                    req.end();
                });
                if (data.error) {
                    throw new Error(data.error.message || JSON.stringify(data.error));
                }
                return data.result;
            }
            catch (err) {
                lastError = err;
                console.log(`\x1b[33m[RPC] Failover triggered off ${url} - Error: ${lastError.message}...\x1b[0m`);
                // Let lazy-rpc know this endpoint failed so it drops it
                this.rpcManager.drop(url);
                retries--;
            }
        }
        throw new Error(`All RPC endpoints failed. Last error: ${lastError?.message}`);
    }
    async getCode(address) {
        const code = await this.call('eth_getCode', [address, 'latest']);
        if (!code || code === '0x') {
            throw new Error(`No contract code found at address ${address}`);
        }
        return code;
    }
    async getStorageAt(address, slot) {
        return this.call('eth_getStorageAt', [address, slot, 'latest']);
    }
}

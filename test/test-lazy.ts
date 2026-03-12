import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const lazyRpc = require('lazy-rpc');
const RPCClass = lazyRpc.RPC || lazyRpc;

async function test() {
    const lazyRpcDir = path.join(process.cwd(), 'node_modules', 'lazy-rpc');
    const rpcListPath = path.join(lazyRpcDir, 'dist', 'rpcList.min.json');

    console.log("Initializing RPC...");
    const rpc = new RPCClass({
        chainId: '0x0001',
        log: true,
        pathToRpcJson: rpcListPath,
    });
    
    console.log("Getting URL...");
    const url = await rpc.getRpcAsync('https');
    console.log("Got URL:", url);
    process.exit(0);
}
test().catch(console.error);

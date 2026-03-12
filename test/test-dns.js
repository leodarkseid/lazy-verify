import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first'); // Force native fetch to use IPv4

import { RPC } from 'lazy-rpc';

async function run() {
    console.log("Starting RPC initialization...");
    const start = Date.now();
    const rpc = new RPC({ chainId: '0x0001', log: true });

    try {
        const u = await rpc.getRpcAsync('https');
        console.log('Got URL in', Date.now() - start, 'ms:', u);
        rpc.destroy();
    } catch (e) {
        console.error('Error:', e.message);
    }
}
run().catch(console.error);

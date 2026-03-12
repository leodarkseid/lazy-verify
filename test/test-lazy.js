import { RPC } from 'lazy-rpc';
const rpc = new RPC({ chainId: '0x0001', log: true });
rpc.getRpcAsync('https').then(url => { console.log('url:', url); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });

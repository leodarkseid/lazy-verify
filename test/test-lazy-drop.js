import { RPC } from 'lazy-rpc';

async function run() {
  const rpc = new RPC({ chainId: '0x0001', log: true });
  // Wait for it to fetch valid URLs in the background
  await new Promise(r => setTimeout(r, 2000));

  for (let i = 0; i < 5; i++) {
    try {
      const u = await rpc.getRpcAsync('https');
      console.log('Got:', u);
      rpc.drop(u);
      console.log('Stats:', rpc.getFailureStats());
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
  process.exit(0);
}
run().catch(console.error);

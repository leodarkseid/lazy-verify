import { EthRPC } from '../src/rpc.js';
import { extractCompilerVersion } from '../src/bytecode.js';

async function test() {
  const rpc = new EthRPC(1);
  // WETH9 on Mainnet
  const weth = await rpc.getCode('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
  console.log('WETH Compiler:', extractCompilerVersion(weth));
}
test().catch(console.error);

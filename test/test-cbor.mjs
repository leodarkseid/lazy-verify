import { extractCompilerVersion } from '../dist/bytecode.js';
import { EthRPC } from '../dist/rpc.js';

async function test() {
  const rpc = new EthRPC(1);
  const weth = await rpc.getCode('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
  console.log("WETH Bytecode Length:", weth.length);
  
  const end = weth.slice(-100);
  console.log("Last 100 chars:", end);
  
  let ascii = '';
  for (let i = 0; i < end.length; i += 2) {
    ascii += String.fromCharCode(parseInt(end.slice(i, i+2), 16));
  }
  // Safe ASCII replace
  console.log("ASCII:", ascii.replace(/[^x20-x7E]/g, '.'));
  
  console.log("Extraction Result:", extractCompilerVersion(weth));
}
test().catch(console.error);

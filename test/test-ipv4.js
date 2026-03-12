import * as https from 'node:https';

const options = {
  hostname: 'eth.llamarpc.com',
  port: 443,
  path: '/',
  method: 'POST',
  family: 4,
  headers: {
    'Content-Type': 'application/json'
  }
};
const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});
req.on('error', e => console.error(e));
req.write(JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }));
req.end();

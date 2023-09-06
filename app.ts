import {ethers} from 'ethers'

const abi = ethers.utils.defaultAbiCoder;
const params = abi.encode(
    ["string[]"], // encode as address array
    [ ['yopp', 'yopp'] ]);

function Encode(data:any){
return abi.encode(
    ["uint32"], // encode as address array
    [ data ]);
}

console.log(Encode(1));
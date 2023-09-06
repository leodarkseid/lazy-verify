"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var abi = ethers_1.ethers.utils.defaultAbiCoder;
var params = abi.encode(["string[]"], // encode as address array
[['yopp', 'yopp']]);
function Encode(data) {
    return abi.encode(["uint32"], // encode as address array
    [data]);
}
console.log(Encode(1));

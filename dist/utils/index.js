"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abiEncoder = exports.encode = exports.isAddress = exports.addressToBytes32 = exports.stringToBytes32 = exports.isStringArray = exports.isString = exports.isNumber = exports.isAsciiString = void 0;
const ethers_1 = require("ethers");
function isAsciiString(str) {
    return /^[\x00-\x7F]*$/.test(str);
}
exports.isAsciiString = isAsciiString;
function isNumber(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
}
exports.isNumber = isNumber;
function isString(str) {
    return typeof str === "string" || str instanceof String;
}
exports.isString = isString;
function isStringArray(data) {
    return Array.isArray(data) && data.every(isString);
}
exports.isStringArray = isStringArray;
function stringToBytes32(str) {
    if (str.length > 32 || !isAsciiString(str)) {
        throw new Error("Invalid label, must be less than 32 characters");
    }
    return "0x" + Buffer.from(str, "ascii").toString("hex").padEnd(64, "0");
}
exports.stringToBytes32 = stringToBytes32;
function addressToBytes32(address) {
    if (!isAddress(address)) {
        throw new Error("Invalid input, must be a valid Ethereum address");
    }
    return address.slice(2).padStart(64, "0");
}
exports.addressToBytes32 = addressToBytes32;
function isAddress(address) {
    return (address.length === 42 &&
        address.startsWith("0x") &&
        ethers_1.ethers.utils.isAddress(address) == true);
}
exports.isAddress = isAddress;
const abi = ethers_1.ethers.utils.defaultAbiCoder;
function encode(data, type) {
    return abi
        .encode([type], // encode as address array
    [data])
        .slice(2);
}
exports.encode = encode;
// type
// uint32
function abiEncoder(data) {
    if (isString(data)) {
        return encode(data, "string");
    }
    else if (isStringArray(data)) {
        return encode(data, "string[]");
    }
    else if (isNumber(data) && data >= 0 && data <= Math.pow(2, 8) - 1) {
        return encode(data, "uint8");
    }
    else if (isNumber(data) && data >= 0 && data <= Math.pow(2, 16) - 1) {
        return encode(data, "uint16");
    }
    else if (isAddress(data)) {
        return encode(data, "address");
    }
    else {
        console.log("Error ! \n Data type not supported yet \n(supported data types are: string, string[], uint8, uint16, address)");
    }
}
exports.abiEncoder = abiEncoder;
//# sourceMappingURL=index.js.map
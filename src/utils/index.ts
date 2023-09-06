import { ethers } from "ethers";
export function isAsciiString(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str);
}

export function isNumber(num: any): boolean {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

export function isString(str: any): boolean {
  return typeof str === "string" || str instanceof String;
}

export function isStringArray(data: any) {
  return Array.isArray(data) && data.every(isString);
}

export function stringToBytes32(str: string): string {
  if (str.length > 32 || !isAsciiString(str)) {
    throw new Error("Invalid label, must be less than 32 characters");
  }
  return "0x" + Buffer.from(str, "ascii").toString("hex").padEnd(64, "0");
}

export function addressToBytes32(address: string): string {
  if (!isAddress(address)) {
    throw new Error("Invalid input, must be a valid Ethereum address");
  }

  return address.slice(2).padStart(64, "0");
}

export function isAddress(address: any) {
  return (
    address.length === 42 &&
    address.startsWith("0x") &&
    ethers.utils.isAddress(address) == true
  );
}

const abi = ethers.utils.defaultAbiCoder;
export function encode(data: any, type: string): string {
  return abi
    .encode(
      [type], // encode as address array
      [data]
    )
    .slice(2);
}

// type
// uint32

export function abiEncoder(data: any) {
  if (isString(data)) {
    return encode(data, "string");
  } else if (isStringArray(data)) {
    return encode(data, "string[]");
  } else if (isNumber(data) && data >= 0 && data <= 2 ** 8 - 1) {
    return encode(data, "uint8");
  } else if (isNumber(data) && data >= 0 && data <= 2 ** 16 - 1) {
    return encode(data, "uint16");
  } else if (isAddress(data)) {
    return encode(data, "address");
  } else {
    console.log(
      "Error ! \n Data type not supported yet \n(supported data types are: string, string[], uint8, uint16, address)"
    );
  }
}

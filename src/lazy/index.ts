export { verifyContract } from "./verifyContract";
export { checkVerification } from "./checkVerification";

export interface ILazy_verify {
  api_key: string | undefined;
  api_url: string;
  contractAddress: string;
  contractName: string;
  sourceCode: string;
  compilerVersion: string;
  optimizationUsed: number;
  runs: number;
  constructorArguments: any;
}


import axios from "axios";
import { ILazy_verify } from "./index";
import { checkVerification } from "./checkVerification";

export async function verifyContract(lazyVerify: ILazy_verify) {
  const response = await axios.post(
    lazyVerify.api_url,
    {
      apikey: lazyVerify.api_key,
      module: "contract",
      action: "verifysourcecode",
      contractaddress: lazyVerify.contractAddress,
      sourceCode: lazyVerify.sourceCode,
      contractname: lazyVerify.contractName,
      compilerversion: lazyVerify.compilerVersion,
      optimizationUsed: lazyVerify.optimizationUsed,
      runs: lazyVerify.runs,
      constructorArguements: lazyVerify.constructorArguments,
    },
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (response.data.status === "1") {
    console.log(
      `Contract verified successfully. GUID: ${response.data.result}`
    );
    console.log("confirming verification ...");
    await checkVerification(
      lazyVerify.api_url,
      lazyVerify.api_key,
      response.data.result
    );
    console.log("Status", response.data.status);
    console.log("Verification confirmed !!!");
  } else {
    console.error(`Error verifying contract: ${response.data.result}`);
  }
}

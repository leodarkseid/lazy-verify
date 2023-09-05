"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyContract = void 0;
const axios_1 = require("axios");
const checkVerification_1 = require("./checkVerification");
function verifyContract(lazyVerify) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post(lazyVerify.api_url, {
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
        }, {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
        });
        if (response.data.status === "1") {
            console.log(`Contract verified successfully. GUID: ${response.data.result}`);
            console.log("confirming verification ...");
            yield (0, checkVerification_1.checkVerification)(lazyVerify.api_url, lazyVerify.api_key, response.data.result);
            console.log("Status", response.data.status);
            console.log("Verification confirmed !!!");
        }
        else {
            console.error(`Error verifying contract: ${response.data.result}`);
        }
    });
}
exports.verifyContract = verifyContract;
//# sourceMappingURL=verifyContract.js.map
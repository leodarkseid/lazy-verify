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
exports.checkVerification = void 0;
const axios_1 = require("axios");
function checkVerification(api_url, api_key, guid_) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post(api_url, {
            apikey: api_key,
            guid: guid_,
            module: "contract",
            action: "checkverifystatus",
        }, {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
        });
        if (response.data.status === "1") {
            console.log("success");
            console.log("status", response.data.status);
            console.log("message", response.data.message);
            console.log("result", response.data.result);
            return true;
        }
        else {
            console.error(`Error confirming verification: ${response.data.result}`);
            return false;
        }
    });
}
exports.checkVerification = checkVerification;
//# sourceMappingURL=checkVerification.js.map
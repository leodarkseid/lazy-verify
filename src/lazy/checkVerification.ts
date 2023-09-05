import axios from "axios";

export async function checkVerification(
  api_url: string,
  api_key: string | undefined,
  guid_: string
): Promise<boolean> {
  const response = await axios.post(
    api_url,
    {
      apikey: api_key,
      guid: guid_,
      module: "contract",
      action: "checkverifystatus",
    },
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    }
  );
  if (response.data.status === "1") {
    console.log("success");
    console.log("status", response.data.status);
    console.log("message", response.data.message);
    console.log("result", response.data.result);
    return true;
  } else {
    console.error(`Error confirming verification: ${response.data.result}`);
    return false;
  }
}

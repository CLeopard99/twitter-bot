import { readFileSync } from "fs";
import twitter from "../api-configs/twitter-config.js";
import { tweetNow } from "../twitter/TwitterUtils.js";
import { deleteFile } from "../utils/DeleteFile.js";
import fs from "fs";

export default function uploadMedia(dest, statusText) {
  let params;
  let b64content;

  if (fs.existsSync(dest)) {
    b64content = readFileSync(dest, {
      encoding: "base64",
    });
  }

  twitter.post("media/upload", { media_data: b64content }, uploaded);

  function uploaded(err, data, response) {
    let mediaIdStr = data.media_id_string;
    params = { status: statusText, media_ids: [mediaIdStr] };
    console.log("Upload: ", params);

    tweetNow(params);
    deleteFile(dest);
  }

  return params;
}

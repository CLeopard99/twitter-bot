import uploadMedia from "../twitter/TwitterUpload.js";
import { createStatusText, readFirebase } from "./utils.js";
import downloadImage from "../utils/DownloadImage.js";

export default async function dailyPlant() {
  console.log("Running dailyPlant...");
  let dest = "src/media/dailyplant.jpg";
  
  let plantInfo = readFirebase();

  setTimeout(() => {
    let statusText = createStatusText(plantInfo.plantName);

    downloadImage(plantInfo.plantImage, dest);

    setTimeout(() => {
      uploadMedia(dest, statusText);
    }, 1000);
  }, 1000);
}

import { ref, query, limitToFirst, remove, get } from "@firebase/database";
import db from "../api-configs/firebase-config.js";

export const createStatusText = (plantName) => {
  let statusText =
    "Succulent/Cacti of the day is: " +
    plantName +
    "\n#PicOfTheDay #PlantTwitter #LearnSomethingNewEveryday";

  return statusText;
};

export function readFirebase() {
  let plantInfo = { plantName: "", plantImage: "" };

  get(query(ref(db, "/"), limitToFirst(1)))
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((item) => {
          plantInfo.plantName = item.val().plantName;
          plantInfo.plantImage = item.val().plantImage;
          remove(item.ref);
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return plantInfo;
}


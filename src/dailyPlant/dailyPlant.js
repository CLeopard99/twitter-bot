
// Post plant of the day every 24 hours
function dailyPlant() {
  let dest = "./media/dailyplant.jpg";
  // readFirebase();
  setTimeout(getPlant, 1000);

  function getPlant() {
    // Store image in project (overrides previous image)

    // downloadImage(plantImage, dest);

    // Give time to ensure image is downloaded
    setTimeout(function () {
      // Read the image to be able to upload it to twitter
      /*
      let b64content = fs.readFileSync(dest, {
        encoding: "base64",
      });

      // Upload the image to be able to post it
      twitter.post("media/upload", { media_data: b64content }, uploaded);
      */

      function uploaded(err, data, response) {
        // Now we can reference the image and post a tweet with the image
        let statusText =
          "Succulent/Cacti of the day is: " +
          plantName +
          "\n#PicOfTheDay #PlantTwitter #LearnSomethingNewEveryday";

        // let mediaIdStr = data.media_id_string;
        let params = { status: statusText };
        console.log(statusText);
        // Post tweet
        tweetNow(params);
      }
    }, 1500);
  }
}


// Firebase: get first object from database and store name and image
function readFirebase() {
  let ref = db.database;
  // Read first entry from reference and then remove it so it is not repeated
  ref.limitToFirst(1).once(
    "value",
    function (snapshot) {
      snapshot.forEach((snap) => {
        plantName = snap.val().plantName;
        plantImage = snap.val().plantImage;
        db.ref("/" + snap.key).remove();
        console.log("Removed " + plantName + "from firebase");
      });
    },
    function (errorObject) {
      console.log("The read (firebase) failed: " + errorObject.code);
    }
  );
}

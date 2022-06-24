import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

scrapeSite();

function scrapeSite() {
  const url = "https://plantsam.com/cacti-succulents/";
  axios(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      const plantSite = $(".relatedthumb");
      const plants = [];

      plantSite.each(function () {
        const plantName = $(this).find("a").text();
        const plantImage = $(this).find("img").attr("src");
        plants.push({
          plantName,
          plantImage,
        });
      });
      shuffle(plants);
    })
    .catch(console.error);
}

// shuffle array for random order (default: alphabetical)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  writeToFile(arr);
}

function writeToFile(arr) {
  const data = JSON.stringify(arr);
  fs.writeFile("plants-db.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log("Plant data saved to JSON");
  });
}

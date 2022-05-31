const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
scrapeSite();

function scrapeSite() {
  const url = "https://example.com";
  axios(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      // store div content and initialise array
      const plantSite = $(".className");
      const plants = [];
      // for each element found, store the content
      plantSite.each(function () {
        const plantName = $(this).find("a").text();
        const plantImage = $(this).find("img").attr("src");
        plants.push({
          plantName,
          plantImage,
        });
      });
      //console.log(plants);
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
  fs.writeFile("succulents-database.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log("Plant data saved to JSON");
  });
}

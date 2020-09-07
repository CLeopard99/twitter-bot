/**********************************************************************
 * plant-scraper.js includes:
 * - Using axios and cheerio to scrape a website for text and images
 * - Shuffling the array of data and writing to JSON file
 * 
 * Author: Charlie Leopard
 *********************************************************************/

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
scrapeSite();

// scrape plant names and images from specific website
function scrapeSite() {
  // url of webpage to scrape
  const url = "https://example.com";
  axios(url)
    .then((response) => {
      // take html of page
      const html = response.data;
      // load html into cheerio
      const $ = cheerio.load(html);
      // store div content and initialise array
      const plantSite = $(".className");
      const plants = [];
      // for each element found, store the content
      plantSite.each(function () {
        const plantName = $(this).find("a").text();
        const plantImage = $(this).find("img").attr("src");
        // push object of data to array
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

// write object array to a JSON file
function writeToFile(arr) {
  // convert array to string
  const data = JSON.stringify(arr);
  // write to json file
  fs.writeFile("succulents-database.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log("Plant data saved to JSON");
  });
}

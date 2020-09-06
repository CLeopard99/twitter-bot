"use strict";

/**********************************************************************
 * plant-scraper.js includes:
 * - Using axios and cheerio to scrape a website for text and images
 * - Shuffling the array of data and writing to JSON file
 * 
 * Author: Charlie Leopard
 *********************************************************************/
var axios = require("axios");

var cheerio = require("cheerio");

var fs = require("fs");

scrapeSite(); // scrape plant names and images from specific website

function scrapeSite() {
  // url of webpage to scrape
  var url = "https://plantsam.com/cacti-succulents/";
  axios(url).then(function (response) {
    // take html of page
    var html = response.data; // load html into cheerio

    var $ = cheerio.load(html); // store div content and initialise array

    var plantSite = $(".relatedthumb");
    var plants = []; // for each element found, store the content

    plantSite.each(function () {
      var plantName = $(this).find("a").text();
      var plantImage = $(this).find("img").attr("src"); // push object of data to array

      plants.push({
        plantName: plantName,
        plantImage: plantImage
      });
    }); //console.log(plants);

    shuffle(plants);
  })["catch"](console.error);
} // shuffle array for random order (default: alphabetical)


function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var _ref = [arr[j], arr[i]];
    arr[i] = _ref[0];
    arr[j] = _ref[1];
  }

  writeToFile(arr);
} // write object array to a JSON file


function writeToFile(arr) {
  // convert array to string
  var data = JSON.stringify(arr); // write to json file

  fs.writeFile("succulents-database.json", data, function (err) {
    if (err) {
      throw err;
    }

    console.log("Plant data saved to JSON");
  });
}
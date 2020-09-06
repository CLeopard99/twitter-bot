"use strict";

var axios = require("axios");

var cheerio = require("cheerio"); // url of webpage to scrape


var url = "https://plantsam.com/cacti-succulents/";
axios(url).then(function (response) {
  // take html of page
  var html = response.data; // load html into cheerio

  var $ = cheerio.load(html); // store statsTable content and initialise array

  var plantList = $(".relatedthumb");
  var plants = []; // for each row, store the stats (columns)

  plantList.each(function () {
    var plantName = $(this).find("a").text();
    var plantImage = $(this).find("img").attr("src"); // push object of stats to array

    plants.push({
      plantName: plantName,
      plantImage: plantImage
    });
  });
  console.log(plants);
})["catch"](console.error);
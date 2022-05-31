/**********************************************************************
 * bot.js includes:
 * - (Re)tweeting, liking, & noticing follows & mentions
 *   with the Twitter API
 * - Reddit's API is used to grab the top post of subreddits
 * - The use of a large JSON file made from web scraping (plant-scraper.js)
 *   to create a new tweet daily
 * - Firebase real-time database is used to store the JSON externally so data
 *   can be taken while automated with Heroku
 * - Image downloading & converting, tweet creation etc.
 *
 * Author: Charlie Leopard
 *********************************************************************/

const db = require("./api-configs/firebase-config");

const download = require("image-downloader");
const fs = require("fs");
// Name and image url of new plant for dailyPlant()
let plantName;
let plantImage;
const database = require("./plants-mock-db"); // JSON database of plants (for local testing)

main();
function main() {
  verify();

  const stream = twitter.stream("statuses/filter", { track: "@DailyPlantBot" });
  stream.on("tweet", mentioned);
  stream.on("follow", followed);

  // Count to post at 11am
  let now = new Date();
  let millisTill11 =
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0, 0) -
    now;
  if (millisTill11 < 0) {
    millisTill11 += 86400000;
  }

  setTimeout(function () {
    dailyPlant();
    callSubreddits();
  }, millisTill11);

  // Retweet something in 10 hour intervals
  // setInterval(retweetRecent, 1000 * 60 * 60 * 10);
  // dailyPlant();
}

/**********************************************
 * Web-scrapped/JSON content
 * - dailyPlant()
 * - create & tweet daily
 **********************************************/

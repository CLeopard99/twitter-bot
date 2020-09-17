/**********************************************************************
 * bot.js includes:
 * - (Re)tweeting, liking, & noticing follows & mentions
 *   with the Twitter API
 * - Reddit's API is used to grab the top post of subreddits
 * - The use of a large JSON file made from web scraping (plant-scraper.js)
 *   to tweet create a new tweet daily
 * - Image downloading & converting, tweet creation etc.
 *
 * Author: Charlie Leopard
 *********************************************************************/

// Imports
const twitter = require("./twitter-config");
const reddit = require("./reddit-config");
const download = require("image-downloader");
const fs = require("fs");
let database = require("./plants-database");
let index;

main();
// Main to call functions in one place
function main() {
  verify();

  // Listen to stream and track activity involving the bot
  const stream = twitter.stream("statuses/filter", { track: "@DailyPlantBot" });
  // When bot is tweeted at, call mentioned function
  stream.on("tweet", mentioned);
  // When the bot is followed, call followed function
  stream.on("follow", followed);

  // Set count to milliseconds till 12pm
  let now = new Date();
  let millisTill12 =
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0) -
    now;
  // If past 12, wait 24 hours
  if (millisTill12 < 0) {
    millisTill12 += 86400000;
  }
  // Call functions at 12pm
  setTimeout(function () {
    //  plant of the day
    dailyPlant();
    // Tweet top post of called subreddits
    callSubreddits();
  }, millisTill12);

  // Retweet something in 10 hour intervals
  setInterval(retweetRecent, 1000 * 60 * 60 * 10);
}

/**********************************************
 * Twitter API functions
 * - verify() & onAuthenticated()
 * - likeTweet()
 * - tweetNow()
 * - mentioned()
 * - followed()
 * - retweetRecent()
 * - checkTweet()
 **********************************************/

// Verify account details and run if correct
function verify() {
  twitter.get(
    "account/verify_credentials",
    {
      include_entities: false,
      skip_status: true,
      include_email: false,
    },
    onAuthenticated
  );
}

function onAuthenticated(err, res) {
  if (err) {
    throw err;
  } else if (res) console.log("Authentication successful. Running bot...\r\n");
}

// Like/favorite tweet
function likeTweet(tweet) {
  twitter.post("favorites/create", { id: tweet.id_str }, function (err) {
    err ? console.log("Failed to like tweet: " + err) : "Tweet liked!";
  });
}

// Post tweet
function tweetNow(tweet) {
  twitter.post("statuses/update", tweet, checkTweet);
}

// Respond when mentioned (tweeted @)
function mentioned(tweet) {
  console.log("Mention received! ", tweet.id);
  // Retweet mentions
  //twitter.post("statuses/retweet/" + tweet.id_str, checkTweet);
  // Get user's username and @name to create tweet
  let name = tweet.user.name;
  let screenName = tweet.user.screen_name;
  let reply =
    "Hey " + name + " @" + screenName + ", Thanks for the mention! :)";
  let params = { status: reply };

  tweetNow(params);
  likeTweet(tweet);
}

// Reponse when new follower recieved
function followed(event) {
  // Get username & screen_name of user who followed bot
  let name = tweet.user.name;
  let screenName = event.source.screen_name;
  let response =
    "Hi, thanks for following me, " + name + "! Hope you enjoy my tweets :) ";
  // Message new follower
  twitter.post(
    "direct_messages/new",
    { user_id: user.id_str, response },
    function (err) {
      err
        ? console.log("Failed to message follower: " + err)
        : "New follower messaged!";
    }
  );
  console.log("I was followed by: @" + screenName);
}

// Retweet recent tweet
function retweetRecent() {
  // Params to search for tweets
  const searchParams = {
    q: "#succulents OR #cacti OR #houseplants filter:media",
    count: 10,
    result_type: "recent",
    lang: "en",
  };

  twitter.get("search/tweets", searchParams, function (err, data) {
    if (!err) {
      // Take id of tweet and retweet
      let retweetId = data.statuses[0].id_str;
      twitter.post("statuses/retweet/" + retweetId, {}, checkTweet);
    }
    //Otherwise, log error
    else {
      console.log("There was an error while searching for tweets: ", err);
    }
  });
}

// Check if function worked by logging tweet or error message
function checkTweet(err, tweet) {
  if (err !== undefined) {
    // error (usually a duplicate retweet)
    console.log(err);
  } else {
    console.log("Tweeted: " + tweet.text);
  }
}

/**********************************************
 * Reddit API functions
 * - callSubreddits()
 * - scrapeSubreddit()
 * - create & tweet top posts
 **********************************************/

// call scrapeSubreddit on subreddits wanted, setInterval() in main requires this callback
function callSubreddits() {
  scrapeSubreddit("succulents");
  scrapeSubreddit("houseplants");
  scrapeSubreddit("cactus");
}

// Gets top post of the last 24 hours of specified subreddit
async function scrapeSubreddit(sub) {
  const subreddit = await reddit.getSubreddit(sub);
  const topPost = await subreddit.getTop({ time: "day", limit: 5 });

  // Stores image url, title, and post id in object array
  let data = [];
  topPost.forEach((post) => {
    data.push({
      link: post.url,
      title: post.title,
      id: post.id,
    });
  });

  // Grab first top post that has an image (jpg)
  let index;
  for (index = 0; index < data.length; index++) {
    let link = data[index].link;
    if (link.substr(link.length - 3) == "jpg") {
      break;
    }
  }

  let title = data[index].title;
  let postUrl = "reddit.com/" + data[index].id;
  let dest = "./media/" + sub + ".jpg";

  let statusText =
    "Today's top post of r/" +
    sub +
    ": " +
    title +
    "\nSource: [" +
    postUrl +
    "]" +
    "\n#PlantTwitter";

  // Store image in project (overrides previous sub image)
  downloadImage(data[index].link, dest);

  // Tweet reddit post with delay to allow for image to be downloaded
  setTimeout(function () {
    // Read the image to be able to upload it to twitter
    let b64content = fs.readFileSync(dest, {
      encoding: "base64",
    });

    // Upload the image to be able to post it
    twitter.post("media/upload", { media_data: b64content }, uploaded);

    function uploaded(err, data, response) {
      // Now we can reference the image and post a tweet with the image

      let mediaIdStr = data.media_id_string;
      let params = { status: statusText, media_ids: [mediaIdStr] };
      console.log(statusText);
      // Post tweet
      //  tweetNow(params);
    }
  }, 1500);
}

/**********************************************
 * Web-scrapped/JSON content
 * - dailyPlant()
 * - create & tweet daily
 **********************************************/

// Post plant of the day every 24 hours
function dailyPlant() {
  // Get index of plant database to post
  readTxt("plantCounter.txt");
  // Store image here
  let dest = "./media/dailyplant.jpg";
  setTimeout(getPlant, 1000);

  function getPlant() {
    let url = database[index].plantImage;
    let plantName = database[index].plantName;
    // Store image in project (overrides previous image)
    downloadImage(url, dest);

    // Give time to ensure image is downloaded
    setTimeout(function () {
      // Read the image to be able to upload it to twitter
      let b64content = fs.readFileSync(dest, {
        encoding: "base64",
      });

      // Upload the image to be able to post it
      twitter.post("media/upload", { media_data: b64content }, uploaded);
      // Write next index to file
      writeTxt("plantCounter.txt");

      function uploaded(err, data, response) {
        // Now we can reference the image and post a tweet with the image
        let statusText =
          "Succulent/Cacti of the day is: " +
          plantName +
          "\n#PicOfTheDay #PlantTwitter #LearnSomethingNewEveryday";

        let mediaIdStr = data.media_id_string;
        let params = { status: statusText, media_ids: [mediaIdStr] };
        console.log(statusText);
        // Post tweet
        //tweetNow(params);
      }
    }, 1500);
  }
}

/**********************************************
 * Other functions
 * - downloadImage()
 * - readTxt()
 * - writeTxt()
 **********************************************/

// Download image from reddit post (url) and store it in destination
function downloadImage(url, dest) {
  const options = {
    url: url,
    dest: dest,
  };

  download
    .image(options)
    .then(({ filename }) => {
      console.log("Image saved to ", filename);
    })
    .catch((err) => console.log(err));
}

// Read text file and store as index (for getting next plant)
function readTxt(file) {
  fs.readFile(file, "utf8", function (err, data) {
    if (err) throw err;
    index = data;
    // Reset database to first if all plants tweeted
    if (index > database.length) index = 0;
    return index;
  });
}

// Increment index and write new number to file
function writeTxt(file) {
  index++;
  fs.writeFile(file, index, (err) => {
    if (err) {
      throw err;
    }
    console.log("Plants-database index incremented: " + index);
  });
}

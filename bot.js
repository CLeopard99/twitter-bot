/**********************************************************************
 * bot.js includes:
 * - (Re)tweeting, liking, & noticing follows & mentions
 * with the Twitter API
 * - Reddit's API is used to grab the top post of subreddits
 * - The use of a large JSON file made from web scraping (plant-scraper.js)
 * to tweet create a new tweet daily
 * - Image downloading & converting, tweet creation etc.
 *
 * Author: Charlie Leopard
 *********************************************************************/

// Imports
const twitter = require("./twitter-config");
const reddit = require("./reddit-config");
const download = require("image-downloader");
const fs = require("fs");

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

  // Post plant of the day
  dailyPlant();
  // Retweet something in 10 hour intervals
  setInterval(retweetRecent, 1000 * 60 * 60 * 10);
  // Every 24 hours post tweet post of called subreddits
  setInterval(callSubreddits, 1000 * 60 * 60 * 24);
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
  const topPost = await subreddit.getTop({ time: "day", limit: 1 });

  // stores image url, title, and post id in object array
  let data = [];
  topPost.forEach((post) => {
    data.push({
      link: post.url,
      title: post.title,
      id: post.id,
    });
  });

  let title = data[0].title;
  let postUrl = "reddit.com/" + data[0].id;
  let dest = "./media/" + sub + ".jpg";
  let statusText =
    "Today's top post of r/" +
    sub +
    ": " +
    title +
    "\nSource: [" +
    postUrl +
    "]";

  // Store image in project (overrides previous sub image)
  downloadImage(data[0].link, dest);

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
      // Post tweet
      tweetNow(params);
    }
  }, 1000);
}

/**********************************************
 * Web-scrapped/JSON content
 * - dailyPlant()
 * - create & tweet daily
 **********************************************/

// Post plant of the day every 24 hours
function dailyPlant() {
  // initialise function variables
  let i = 0; // counter to post next plant
  let plants = [];
  let plantName = "";
  let dest = "./media/dailyplant.jpg";

  readJson();
  setInterval(getPlant, 1000 * 60 * 60 * 24);

  // read plant list from succulents-database.json
  function readJson() {
    fs.readFile("succulents-database.json", "utf-8", (err, data) => {
      if (err) {
        throw err;
      }
      // parse JSON object
      plants = JSON.parse(data.toString());
    });
  }

  function getPlant() {
    //console.log(plants[i]);
    // Store image in project (overrides previous image)
    let url = plants[i].plantImage;
    plantName = plants[i].plantName;
    downloadImage(url, dest);
    i++;

    setTimeout(function () {
      // Read the image to be able to upload it to twitter
      let b64content = fs.readFileSync(dest, {
        encoding: "base64",
      });

      // Upload the image to be able to post it
      twitter.post("media/upload", { media_data: b64content }, uploaded);

      function uploaded(err, data, response) {
        // Now we can reference the image and post a tweet with the image
        let statusText =
          "Succulent/Cacti of the day is: " +
          plantName +
          "\n#PicOfTheDay #LearnSomethingNewEveryday";

        let mediaIdStr = data.media_id_string;
        let params = { status: statusText, media_ids: [mediaIdStr] };
        // Post tweet
        tweetNow(params);
      }
    }, 1000);
  }
}

/**********************************************
 * Other functions
 * - downloadImage()
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

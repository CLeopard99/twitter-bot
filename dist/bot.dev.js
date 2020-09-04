"use strict";

var twitter = require("./twitterConfig");

var reddit = require("./redditConfig");

var download = require("image-downloader");

var fs = require("fs");

main();

function main() {
  verify(); // Listen to stream and tracks activity involving the bot

  var stream = twitter.stream("statuses/filter", {
    track: "@RedditPlants"
  }); // When bot is tweeted at, call mentioned function

  stream.on("tweet", mentioned); // When the bot is followed, call followed function

  stream.on("follow", followed); // Retweet when ran and then in 4 hour intervals

  retweetRecent();
  setInterval(retweetRecent, 1000 * 60 * 60 * 6); // When ran and every 24 hours post top post of called subreddits

  callSubreddits();
  setInterval(callSubreddits, 1000 * 60 * 60 * 24);
} // Verify account details and run if correct


function verify() {
  twitter.get("account/verify_credentials", {
    include_entities: false,
    skip_status: true,
    include_email: false
  }, onAuthenticated);
}

function onAuthenticated(err, res) {
  if (err) {
    throw err;
  } else if (res) console.log("Authentication successful. Running bot...\r\n");
}

function mentioned(tweet) {
  console.log("Mention received! ", tweet.id); // Retweet mentions
  //twitter.post("statuses/retweet/" + tweet.id_str, checkRetweet);

  var name = tweet.user.name;
  var screenName = tweet.user.screen_name;
  var reply = "Hey " + name + " @" + screenName + ", Thanks for the mention! :)";
  console.log(reply);
  tweetNow(reply);
  likeTweet(tweet);
} // Like/favorite tweet


function likeTweet(tweet) {
  twitter.post("favorites/create", {
    id: tweet.id_str
  }, function (err) {
    err ? console.log("Failed to like tweet: " + err) : "Tweet liked!";
  });
} // Post tweet


function tweetNow(tweetText) {
  var tweet = {
    status: tweetText
  };
  twitter.post("statuses/update", tweet, checkRetweet);
}

function followed(event) {
  // Get username & screen_name of user who followed bot
  var name = tweet.user.name;
  var screenName = event.source.screen_name;
  var response = "Hi, thanks for following me, " + name + "! Hope you enjoy my tweets :) "; // Message new follower

  twitter.post("direct_messages/new", {
    user_id: user.id_str,
    response: response
  }, function (err) {
    err ? console.log("Failed to message follower: " + err) : "New follower messaged!";
  });
  console.log("I was followed by: @" + screenName);
} // Retweet recent tweet


function retweetRecent() {
  // Params to search for tweets
  var searchParams = {
    q: "#succulents OR #cacti OR #houseplants filter:media",
    count: 10,
    result_type: "recent",
    lang: "en"
  };
  twitter.get("search/tweets", searchParams, function (err, data) {
    if (!err) {
      // Take id of tweet and retweet
      var retweetId = data.statuses[0].id_str;
      twitter.post("statuses/retweet/" + retweetId, {}, checkRetweet);
    } //Otherwise, log error
    else {
        console.log("There was an error while searching for tweets: ", err);
      }
  });
} // Check if function worked by logging tweet or error message


function checkRetweet(err, tweet) {
  if (err !== undefined) {
    // error (usually a duplicate retweet)
    console.log(err);
  } else {
    console.log("Tweeted: " + tweet.text);
  }
} // Gets top post of the last 24 hours of specified subreddit


function scrapeSubreddit(sub) {
  var subreddit, topPost, data, title, postUrl, dest;
  return regeneratorRuntime.async(function scrapeSubreddit$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(reddit.getSubreddit(sub));

        case 2:
          subreddit = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(subreddit.getTop({
            time: "day",
            limit: 1
          }));

        case 5:
          topPost = _context.sent;
          // stores image url, title, and post id in object array
          data = [];
          topPost.forEach(function (post) {
            data.push({
              link: post.url,
              title: post.title,
              id: post.id
            });
          });
          title = data[0].title;
          postUrl = "reddit.com/" + data[0].id;
          console.log(data[0]);
          dest = "./media/" + sub + ".jpg"; // Store image in project (overrides previous image)

          downloadImage(data[0].link, dest); // Tweet reddit post with delay to allow for image to be downloaded (due to async function)

          setTimeout(function () {
            // Read the image to be able to upload it to twitter
            var b64content = fs.readFileSync(dest, {
              encoding: "base64"
            }); // Upload the image to be able to post it

            twitter.post("media/upload", {
              media_data: b64content
            }, uploaded);

            function uploaded(err, data, response) {
              // Now we can reference the image and post a tweet with the image
              var statusText = "Today's top post of r/" + sub + ": " + title + "\nSource: [" + postUrl + "]";
              var mediaIdStr = data.media_id_string;
              var params = {
                status: statusText,
                media_ids: [mediaIdStr]
              }; // Post tweet

              twitter.post("statuses/update", params, checkRetweet);
            }
          }, 1000);

        case 14:
        case "end":
          return _context.stop();
      }
    }
  });
} // call scrapeSubreddit on subreddits wanted, setInterval() in main requires this callback


function callSubreddits() {
  scrapeSubreddit("succulents");
  scrapeSubreddit("houseplants");
  scrapeSubreddit("cactus");
} // Download image from reddit post (url) and store it in destination


function downloadImage(url, dest) {
  var options = {
    url: url,
    dest: dest
  };
  download.image(options).then(function (_ref) {
    var filename = _ref.filename;
    console.log("Image saved to ", filename);
  })["catch"](function (err) {
    return console.log(err);
  });
}
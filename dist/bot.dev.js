"use strict";

var config = require("./config");

var twit = require("twit");

var T = new twit(config);
T.get("account/verify_credentials", {
  include_entities: false,
  skip_status: true,
  include_email: false
}, onAuthenticated);

function onAuthenticated(err, res) {
  if (err) {
    throw err;
  } else if (res) console.log("Authentication successful. Running bot...\r\n");
} // Listen to stream and tracks activity involving the bot


var stream = T.stream("statuses/filter", {
  track: "@Succulent_Bot"
}); // When bot is tweeted at, call mentioned function

stream.on("tweet", mentioned); // When the bot is followed, call followed function

stream.on("follow", followed);

function followed(event) {
  // Get username & screen_name of user who followed bot
  var name = tweet.user.name;
  var screenName = event.source.screen_name;
  var response = "Hi, thanks for following me, " + name + "! Hope you enjoy my tweets :) "; // Message new follower

  T.post('direct_messages/new', {
    user_id: user.id_str,
    response: response
  }, function (err) {
    err ? console.log("Failed to message follower: " + err) : "New follower messaged!";
  });
  console.log("I was followed by: @" + screenName);
}

function mentioned(tweet) {
  console.log("Mention received! ", tweet.id); // Like mentions
  //T.post('favorites/create', { id: tweet.id }, logReponse);
  // Retweet mentions
  //T.post('statuses/retweet/:id', {id: tweet.id}, logReponse);

  var name = tweet.user.name;
  var screenName = tweet.user.screen_name;
  var reply = "Hey " + name + " @" + screenName + ", Thanks for the mention! :)";
  console.log(reply);
  tweetNow(reply);
  likeTweet(tweet);
} // Like/favorite tweet


function likeTweet(tweet) {
  T.post("favorites/create", {
    id: tweet.id_str
  }, function (err) {
    err ? console.log("Failed to like tweet: " + err) : "Tweet liked!";
  });
} // Post tweet


function tweetNow(tweetText) {
  var tweet = {
    status: tweetText
  };
  T.post("statuses/update", tweet, checkRetweet);
} // Params to search for tweets


var searchParams = {
  q: "#succulents",
  count: 10,
  result_type: "recent",
  lang: "en"
}; // Retweet recent tweet

function retweetRecent() {
  T.get("search/tweets", searchParams, function (err, data) {
    if (!err) {
      // Take id of tweet and retweet
      var retweetId = data.statuses[0].id_str;
      T.post("statuses/retweet/" + retweetId, {}, checkRetweet);
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
} // Retweet when ran and then in 4 hour intervals


retweetRecent();
setInterval(retweetRecent, 1000 * 60 * 60 * 4);
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
}); // When the bot is followed, call followed function
//stream.on("follow", followed);
// When bot is tweeted at, call mentioned function

stream.on("tweet", mentioned);
/*
// Get screenName of user who followed bot
function followed(event) {
  let screenName = event.source.screen_name;
  let response = "Thanks for following me, @" + screenName + " :)";
  // Post thankyou tweet to user
  T.post("statuses/update", { status: response }, checkRetweet);

  console.log('I was followed by: @' + screenName);
}
*/

function mentioned(tweet) {
  console.log("Mention received! ", tweet.id); // Like mentions
  //T.post("favorites/create", { id: tweet.id }, logReponse);
  // Retweet mentions
  //T.post('statuses/retweet/:id', {id: tweet.id}, logReponse);

  var screenName = tweet.user.screen_name;
  var reply = "Hey @" + screenName + ", Thanks for the mention!";
  console.log(reply);
  T.post("statuses/update", {
    status: reply
  }, checkRetweet(reply));
} // Params to search for tweets according to query q


var searchParams = {
  q: "#succulents",
  // Only required param
  result_type: "recent",
  count: 10,
  lang: "en"
};

function retweet() {
  T.get("search/tweets", searchParams, function (error, data) {
    var tweets = data.statuses;

    for (var i = 0; i < tweets.length; i++) {
      console.log(tweets[i].text);
    } // If our search request to the server had no errors...


    if (!error) {
      // ...then we grab the ID of the tweet we want to retweet...
      var retweetId = data.statuses[0].id_str; // ...and then we tell Twitter we want to retweet it!

      T.post("statuses/retweet/" + retweetId, {}, tweeted);
    } // However, if our original search request had an error, we want to print it out here.
    else {
        if (debug) {
          console.log("There was an error while searching for tweets: ", error);
        }
      }
  });
}

function checkRetweet(err, reply) {
  err !== undefined ? console.log("Problem when retweeting. Possibly already retweeted this tweet! " + err) : console.log("Retweeted: " + reply);
}

retweet; // Retweet every 4 hours

setInterval(retweet, 1000 * 60 * 60 * 4);
"use strict";

var functions = require('firebase-functions');

var twit = require("twit");

var config = require("./config");

var T = new twit(config);

var admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
T.get("account/verify_credentials", {
  include_entities: false,
  skip_status: true,
  include_email: false
}, onAuthenticated);

function onAuthenticated(err, res) {
  if (err) {
    throw err;
  }

  console.log("Authentication successful. Running bot...\r\n");
} // Uses the stream API to 'like' any tweet the bot is mentioned in


var stream = T.stream("statuses/filter", {
  track: ["@Succulent_Bot"]
});
stream.on("tweet", function (tweet) {
  console.log("Tweet recieved! " + tweet);
  T.post("statuses/retweet/:id", {
    id: tweet.id
  }, function (err, data, response) {
    console.log(err, data, reponse);
  });
});
/*
// Params to search for tweets according to query q
let params = {
  q: "#succulent", // Only required param
  result_type: "recent",
  count: 10,
};

function retweet() {
  searchTweets(params);
}
setInterval(retweet, 2000);

function searchTweets(params) {
  T.get("search/tweets", params, (err, data, response) => {
    let tweets = data.statuses;
    if (!err) {
        // Take ID of tweets to retweet
      for (let dat of tweets) {
        let retweetId = dat.id_str;
        postTweet(retweetId);
      }
    }
  });
}

function postTweet(retweetId) {
  T.post(
    "statuses/retweet/:id",
    {
      id: retweetId,
    },
    responded(err, response)
  );
}

function responded(err, response) {
  if (response) console.log("Retweeted! " + retweetId);
  if (err) console.log("Something went wrong while retweeting");
}
*/
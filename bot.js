const config = require("./config");
const twit = require("twit");
const T = new twit(config);

T.get(
  "account/verify_credentials",
  {
    include_entities: false,
    skip_status: true,
    include_email: false,
  },
  onAuthenticated
);

function onAuthenticated(err, res) {
  if (err) {
    throw err;
  } else if (res) console.log("Authentication successful. Running bot...\r\n");
}

// Listen to stream and tracks activity involving the bot
const stream = T.stream("user");
// When the bot is followed, call followed function
stream.on("follow", followed);
// When bot is tweeted at, call mentioned function
stream.on("tweet", mentioned);

// Get screenName of user who followed bot
function followed(event) {
  let screenName = event.source.screen_name;
  let response = "Thanks for following me, @" + screenName + " :)";
  // Post thankyou tweet to user
  T.post("statuses/update", { status: response }, tweeted);

  console.log("I was followed by: @" + screenName);
}

function mentioned(tweet) {
  console.log("Mention received! ", tweet);
  // Like mentions
  T.post("favorites/create", { id: tweet.id }, logReponse);
  // Retweet mentions
  // T.post('statuses/retweet/:id', {id: tweet.id}, logReponse);
  let screenName = tweet.user.screen_name;
  let reply = "Hey @" + screenName + ", Thanks for the mentions!";
  console.log(reply);
  T.post("statuses/update", { status: reply }, tweeted);
}

// logs errors from requests
function logReponse(err) {
  console.log(err);
}

// Params to search for tweets according to query q
let params = {
  q: "#succulents", // Only required param
  result_type: "popular",
  count: 10,
  lang: "en",
};

function retweet() {
  T.get("search/tweets", params, function (err, data) {
    if (!err) {
      let retweetId = data.statuses.id;
      T.post("statuses/retweet/" + retweetId, {}, checkRetweet);
    } else {
      console.log("There was an error during tweet search: ", error);
    }
  });
}

function checkRetweet(err, reply) {
  err !== undefined
    ? console.log(
        err +
          'Problem when retweeting. Possibly already retweeted this tweet!'
      )
    : console.log("Retweeted: " + reply);
}

// Retweet every 4 hours
retweet();
setInterval(retweet, 4 * 60 * 60 * 1000);

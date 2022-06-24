import twitter from "../api-configs/twitter-config.js";

export const verify = () => {
  twitter.get(
    "account/verify_credentials",
    {
      include_entities: false,
      skip_status: true,
      include_email: false,
    },
    onAuthenticated
  );
};

function onAuthenticated(err, res) {
  if (err) {
    throw err;
  } else if (res) console.log("Authentication successful. Running bot...\r\n");
}

function likeTweet(tweet) {
  twitter.post("favorites/create", { id: tweet.id_str }, function (err) {
    console.log("Failed to like tweet: " + err);
  });
}

export function tweetNow(tweet) {
  twitter.post("statuses/update", tweet, checkTweet);
}

export function mentioned(tweet) {
  console.log("Mention received! ", tweet.id);

  // twitter.post("statuses/retweet/" + tweet.id_str, checkTweet);
  let name = tweet.user.name;
  let screenName = tweet.user.screen_name;
  let reply =
    "Hey " + name + " @" + screenName + ", Thanks for the mention! :)";
  let params = { status: reply };

  // tweetNow(params);
  likeTweet(tweet);
}

export function retweetRecent() {
  const searchParams = {
    q: "#succulents OR #cactus OR #cacti OR #houseplant OR #houseplants filter:media",
    count: 10,
    result_type: "recent",
    lang: "en",
  };

  twitter.get("search/tweets", searchParams, function (err, data) {
    if (!err) {
      let retweetId = data.statuses[0].id_str;
      twitter.post("statuses/retweet/" + retweetId, {}, checkTweet);
    } else {
      console.log("There was an error while searching for tweets: ", err);
    }
  });
}

export function followed(event) {
  let name = tweet.user.name;
  console.log("New follower: ", name);

  let response =
    "Hi, thanks for following PlantBot, " +
    name +
    "! Hope you enjoy the tweets :) ";

  twitter.post(
    "direct_messages/new",
    { user_id: user.id_str, response },
    function (err) {
      console.log("Failed to message follower: " + err);
    }
  );
}

function checkTweet(err, tweet) {
  if (err !== undefined) {
    console.log(err);
  } else {
    console.log("Tweeted: " + tweet.text);
  }
}

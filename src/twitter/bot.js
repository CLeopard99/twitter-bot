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
  
  function checkTweet(err, tweet) {
    if (err !== undefined) {
      // error (usually a duplicate retweet)
      console.log(err);
    } else {
      console.log("Tweeted: " + tweet.text);
    }
  }
  
  
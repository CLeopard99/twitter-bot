# NodeJS Twitter Bot

I built this Twitter-Bot built in NodeJS to practice more with REST APIs and I wanted to learn how to build a bot. This bot is deployed to Heroku and be found at [@DailyPlantBot](https://twitter.com/DailyPlantBot) on Twitter , which tweets the top post of my favorite plant subreddits, post a new succulent/cacti every day, retweets every 10 hours, and responds to activity involving the bot.

This project includes the following:

- The Twitter API (with [twit](https://github.com/not-an-aardvark/snoowrap)) is used to tweet, tweet with media, search & retweet, like, & notice follows & mentions

- Uses the Reddit API (with [snoowrap](https://github.com/not-an-aardvark/snoowrap)) to grab the top posts of specified subreddits

- Axios and Cheerio are used for web-scraping to write to a large JSON file to create unique daily tweets

- The functions required to download images from urls, convert to base64 for media uploads, tweet creation etc.

Have a look at bot.js for more information.

## Making Your Own Bot  

If you wanted to build something similar, you will first have to connect to Twitter's API by:

1. Creating a Twitter account for the bot (Twitter does not allows multiple accounts on the same email)

2. Log in [here](https://dev.twitter.com/apps/new) and fill in the form for a developer account

3. You can now access the developer portal which has the:

    - Settings for updating details

    - Permissions for the bot (Read/Write/Message)

    - Keys and Access Token tab for your config file

4. Click `Create my access token` and fill in the fields for your config file, twitter-config.js shows an example of this:

```js
module.exports = {
  consumer_key:         'XXXXXXXX',
  consumer_secret:      'XXXXXXXX',
  access_token:         'XXXXXXXX',
  access_token_secret:  'XXXXXXXX'
}
```

5. You can now create your own bot with your own values and interact with other APIs or databases

6. Type the following in the command line in your project directory:

```node
node bot.js
```

If you have done it correctly (with immediate function calls) then you should see some activity e.g. the bot tweeting. A running server like Heroku can run your Twitter bot for you.

## Credits

[Twit API Client for Node](https://www.npmjs.com/package/twit)

[snoowrap JS Wrapper for Reddit API](https://github.com/not-an-aardvark/snoowrap)

[Axios HTTP Client](https://www.npmjs.com/package/axios)

[Cheerio API](https://www.npmjs.com/package/cheerio)

[Node Image Downloader](https://www.npmjs.com/package/image-downloader)

## Improvements to be made

- [ ] Resize images to be fully visible without pressing

- [ ] Edit tweets over 140 characters (end with ...)

- [ ] Prevent duplicate posts

- [ ] Tweet at more specific times

## License

```txt
Copyright 2020 Charles Leopard

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   <http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```


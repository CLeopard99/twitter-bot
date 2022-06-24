import {
  verify,
  followed,
  mentioned,
  retweetRecent,
} from "./twitter/TwitterUtils.js";
import { getWaitTime, waitInterval } from "./utils/TimeUtils.js";
import subredditScraper from "./reddit/SubredditScraper.js";
import dailyPlant from "./dailyPlant/DailyPlant.js";
import twitter from "./api-configs/twitter-config.js";

main();

export default function main() {
  console.log("Running main...");
  verify();

  const stream = twitter.stream("statuses/filter", { track: "@DailyPlantBot" });
  stream.on("tweet", mentioned);
  stream.on("follow", followed);

  setTimeout(dailyPlant, getWaitTime(9));
  setTimeout(subredditScraper, getWaitTime(12));
  // dailyPlant()
  // subredditScraper()

  setInterval(retweetRecent, waitInterval(10));
}

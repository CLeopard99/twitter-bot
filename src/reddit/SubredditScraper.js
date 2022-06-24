import reddit from "../api-configs/reddit-config.js";
import downloadImage from "../utils/DownloadImage.js";
import { tweetNow } from "../twitter/TwitterUtils.js";
import { getTopImagePost, createStatusText } from "./utils.js";
import uploadMedia from "../twitter/TwitterUpload.js";

export default function callSubreddits() {
  scrapeSubreddit("succulents");
  scrapeSubreddit("houseplants");
  scrapeSubreddit("cactus");
}

export async function scrapeSubreddit(sub) {
  const subreddit = await reddit.getSubreddit(sub);
  const topPost = await subreddit.getTop({ time: "day", limit: 5 });

  let redditPost = getTopImagePost(topPost);
  let dest = "src/media/" + sub + ".jpg";

  setTimeout(() => {
    let statusText = createStatusText(redditPost, sub);
    downloadImage(redditPost.link, dest);

    setTimeout(() => {
      uploadMedia(dest, statusText);
    }, 1000);
  }, 1000);
}

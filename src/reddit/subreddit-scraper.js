import { getSubreddit } from "./api-configs/reddit-config";
import downloadImage from "../utils/image-downloader";

import { readFileSync } from "fs";

function callSubreddits() {
  scrapeSubreddit("succulents");
  scrapeSubreddit("houseplants");
  scrapeSubreddit("cactus");
}

// Gets top post of the last 24 hours of specified subreddit
async function scrapeSubreddit(sub) {
  const subreddit = await getSubreddit(sub);
  const topPost = await subreddit.getTop({ time: "day", limit: 5 });

  let data = [];
  topPost.forEach((post) => {
    data.push({
      link: post.url,
      title: post.title,
      id: post.id,
    });
  });

  // Grab first top post that has an image (jpg)
  let index;
  for (index = 0; index < data.length; index++) {
    let link = data[index].link;
    if (link.substr(link.length - 3) == "jpg") {
      break;
    }
  }

  let title = data[index].title;
  let postUrl = "reddit.com/" + data[index].id;
  let dest = "./media/" + sub + ".jpg";

  let statusText =
    "Today's top post of r/" +
    sub +
    ": " +
    title +
    "\nSource: [" +
    postUrl +
    "]" +
    "\n#PlantTwitter";

  downloadImage(data[index].link, dest);

  // Tweet reddit post with delay to allow for image to be downloaded
  setTimeout(function () {
    // Read the image to be able to upload it to twitter
    let b64content = readFileSync(dest, {
      encoding: "base64",
    });

    twitter.post("media/upload", { media_data: b64content }, uploaded);

    function uploaded(err, data, response) {
      let mediaIdStr = data.media_id_string;
      let params = { status: statusText, media_ids: [mediaIdStr] };
      // console.log(statusText);
      tweetNow(params);
    }
  }, 1500);
}

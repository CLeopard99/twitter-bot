export function getTopImagePost(topPost) {
  let data = [];
  let redditPost = { link: "", title: "", id: "" };

  topPost.forEach((post) => {
    data.push({
      link: post.url,
      title: post.title,
      id: post.id,
    });
  });

  let index;
  for (index = 0; index < data.length; index++) {
    let link = data[index].link;
    if (link.substr(link.length - 3) === "jpg") {
      redditPost.link = link;
      redditPost.title = data[index].title;
      redditPost.id = data[index].id;
      break;
    }
  }

  return redditPost;
}

export function createStatusText(redditPost, sub) {
  let postUrl = "reddit.com/" + redditPost.link;

  let statusText =
    "Today's top post of r/" +
    sub +
    ": " +
    redditPost.title +
    "\nSource: [" +
    postUrl +
    "]" +
    "\n#PlantTwitter #" +
    sub;

  return statusText;
}

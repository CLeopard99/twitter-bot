
export default function imageDownloader(url, dest) {
  const options = {
    url: url,
    dest: dest,
  };

  download
    .image(options)
    .then(({ filename }) => {
      console.log("Image saved to ", filename);
    })
    .catch((err) => console.log(err));
}

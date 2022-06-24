import download from "image-downloader";

export default function downloadImage(url, dest) {
  const options = {
    url: url,
    dest: dest,
  };

  download
    .image(options)
    .then(({ filename }) => {
      console.log("Image saved to ", filename);
    })
    .catch((err) => {
      console.log(err);
    });
}

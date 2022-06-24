import fs from "fs";

export const deleteFile = (path) => {
  if (fs.existsSync(path)) {
    fs.unlink(path, (err) => {
      if (err) {
        throw err;
      }
      console.log(path, " removed");
    });
  }
};

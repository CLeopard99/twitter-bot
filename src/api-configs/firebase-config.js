import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "XXXXXXXXXXXXXXXX",
  authDomain: "PROJECT-NAME.firebaseapp.com",
  databaseURL: "https://PROJECT-NAME.firebaseio.com",
  projectId: "PROJECT-NAME",
  storageBucket: "PROJECT-NAME.appspot.com",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default db;

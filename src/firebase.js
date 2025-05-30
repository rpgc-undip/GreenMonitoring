// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {

    apiKey: "AIzaSyA35-khWDHHjGth1-10qQ1zoKz_2yEFVZg",
  
    authDomain: "iot-project-e32e9.firebaseapp.com",
  
    databaseURL: "https://iot-project-e32e9-default-rtdb.asia-southeast1.firebasedatabase.app",
  
    projectId: "iot-project-e32e9",
  
    storageBucket: "iot-project-e32e9.firebasestorage.app",
  
    messagingSenderId: "371672604748",
  
    appId: "1:371672604748:web:df249c9f8a8abad66f94e9"
  
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Realtime Database instance
const database = getDatabase(app);

export { database };

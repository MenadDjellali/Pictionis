// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAuth, initializeAuth, getReactNativePersistence } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore")

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_UYy4QLx5clGxLwMarLxjdd3PwRRErdI",
  authDomain: "pictlonis-74bda.firebaseapp.com",
  projectId: "pictlonis-74bda",
  storageBucket: "pictlonis-74bda.appspot.com",
  messagingSenderId: "336410545394",
  appId: "1:336410545394:web:f92e874761d81a7517146b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db };

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


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
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBPBy4qxwE4Guw48WmpvrjjKIGFYs8CND8",
  authDomain: "ppantry-2ed2a.firebaseapp.com",
  projectId: "ppantry-2ed2a",
  storageBucket: "ppantry-2ed2a.appspot.com",
  messagingSenderId: "351174204563",
  appId: "1:351174204563:web:da24f4a783c0d6412d4166",
  measurementId: "G-2LDSMW6862"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };
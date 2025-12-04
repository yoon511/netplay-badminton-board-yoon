// app/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCKAEwUqTRwmgORUU-dU3BXHFWSDk7SIGs",
  authDomain: "netplay-badminton-yoon.firebaseapp.com",
  databaseURL:
    "https://netplay-badminton-yoon-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "netplay-badminton-yoon",
  storageBucket: "netplay-badminton-yoon.firebasestorage.app",
  messagingSenderId: "886512443470",
  appId: "1:886512443470:web:650af2accfe424697e631f",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

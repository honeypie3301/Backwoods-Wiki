import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxl3qo0Wes38BMQ7ndzmiNfeUHNYojb2U",
  authDomain: "gen-lang-client-0494583216.firebaseapp.com",
  projectId: "gen-lang-client-0494583216",
  storageBucket: "gen-lang-client-0494583216.firebasestorage.app",
  messagingSenderId: "201935087492",
  appId: "1:201935087492:web:658765eadec4d13a5edfd1"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID provisioned by the platform
export const db = getFirestore(app, "ai-studio-thebackwoodswiki-ac0523f9-a958-4030-9d0b-0b30a0bd2277");


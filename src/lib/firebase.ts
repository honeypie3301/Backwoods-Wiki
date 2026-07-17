import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Read Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if configuration is provided (specifically the apiKey)
export const hasConfig = !!firebaseConfig.apiKey;

// Initialize app with config or mock/empty config if not provided to avoid crash at load time
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from env or fallback
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-thebackwoodswiki-ac0523f9-a958-4030-9d0b-0b30a0bd2277";

export const db = getFirestore(app, databaseId);


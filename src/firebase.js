import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, remove } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyD2dgQvsD_Mqcx-uI81GrbJMDpGAMV6vLU",
  authDomain: "invitation-app-66f04.firebaseapp.com",
  databaseURL: "https://invitation-app-66f04-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "invitation-app-66f04",
  storageBucket: "invitation-app-66f04.firebasestorage.app",
  messagingSenderId: "1068064881864",
  appId: "1:1068064881864:web:c06448658ff126861db9fd"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Database
export const database = getDatabase(app);

// Initialize Auth
export const auth = getAuth(app);

// Sign in anonymously
export const initializeAuth = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Auth error:', error);
  }
};

// Get reference to guests database
export const guestsRef = ref(database, 'guests');

export default app;

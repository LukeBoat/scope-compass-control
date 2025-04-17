import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOSfz3RQH96vXfBW33uhxla2miQSNPp3g",
  authDomain: "scope-53569.firebaseapp.com",
  projectId: "scope-53569",
  storageBucket: "scope-53569.firebasestorage.app",
  messagingSenderId: "436099853043",
  appId: "1:436099853043:web:8b90b7a2c0290b088ee586",
  measurementId: "G-V1JGZEW2LJ",
  databaseURL: "https://scope-53569-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Functions
export const functions = getFunctions(app);

export default app; 
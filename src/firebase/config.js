import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyDo-tdAzgLKRTeVN1GnGzdaoOUEOkZQ4ZA",
  authDomain: "task-board-f2995.firebaseapp.com",
  databaseURL: "https://task-board-f2995-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "task-board-f2995",
  storageBucket: "task-board-f2995.firebasestorage.app",
  messagingSenderId: "859062169632",
  appId: "1:859062169632:web:dd4273217ba0b590dc0c45",
  measurementId: "G-M7VT69VE6M"
};
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
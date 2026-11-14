import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// Firebase configuration loaded strictly from .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || import.meta.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Friendly Bengali Error Messages for Firebase Auth
export const getFirebaseErrorMessage = (error) => {
  const code = typeof error === 'string' ? error : error?.code;
  switch (code) {
    case 'auth/invalid-email':
      return 'ইমেইল অ্যাড্রেসের ফরম্যাট সঠিক নয়।';
    case 'auth/user-disabled':
      return 'এই অ্যাকাউন্টটি অ্যাডমিন দ্বারা নিষ্ক্রিয় করা হয়েছে।';
    case 'auth/user-not-found':
      return 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। দয়া করে রেজিস্ট্রেশন করুন।';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন। অনুগ্রহ করে যাচাই করে আবার চেষ্টা করুন।';
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি আছে। অনুগ্রহ করে লগইন করুন।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ডটি দুর্বল। কমপক্ষে ৬টি অক্ষরের পাসওয়ার্ড ব্যবহার করুন।';
    case 'auth/network-request-failed':
      return 'ইন্টারনেট সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে আপনার নেটওয়ার্ক চেক করুন।';
    case 'auth/too-many-requests':
      return 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে অ্যাকাউন্টটি সাময়িকভাবে লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।';
    case 'auth/popup-closed-by-user':
      return 'গুগল সাইন-ইন উইন্ডোটি বন্ধ করা হয়েছে।';
    case 'auth/popup-blocked':
      return 'ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে পপ-আপ অনুমোদন করুন।';
    case 'auth/operation-not-allowed':
      return 'ফায়ারবেসে এই সাইন-ইন মেথডটি এনাবল করা নেই। Firebase কনসোলে Email/Password বা Google সাইন-ইন চালু করুন।';
    default:
      return error?.message || 'অথেনটিকেশন প্রক্রিয়ায় একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।';
  }
};

export { 
  app, 
  auth, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup
};

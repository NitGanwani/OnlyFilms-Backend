import * as dotenv from 'dotenv';
dotenv.config();

export const user = process.env.DB_USER;
export const passwd = process.env.DB_PASSWORD;
export const db = process.env.DB_NAME;
export const secret = process.env.JWT_SECRET;
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'onlyfilms-3b5d5.firebaseapp.com',
  projectId: 'onlyfilms-3b5d5',
  storageBucket: 'onlyfilms-3b5d5.appspot.com',
  messagingSenderId: '393689380288',
  appId: '1:393689380288:web:94aaefdf480775bd864425',
};

import { initializeApp } from 'firebase/app';

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG!);

const firebase = initializeApp(firebaseConfig);

export default firebase;

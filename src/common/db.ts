import { getFirestore } from 'firebase/firestore';
import firebase from './firebase';

const db = getFirestore(firebase);

export default db;

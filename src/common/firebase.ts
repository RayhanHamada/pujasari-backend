import { initializeApp } from 'firebase/app';
import constants from 'src/constants';

const firebaseConfig = JSON.parse(constants.FIREBASE_CONFIG!);

const firebase = initializeApp(firebaseConfig);

export default firebase;

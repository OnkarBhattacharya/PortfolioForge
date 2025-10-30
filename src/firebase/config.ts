
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  "projectId": "studio-3849653404-e5627",
  "appId": "1:978801814369:web:fe79a420d9bd15522cf320",
  "apiKey": "AIzaSyCro9bdB4rd9oD64EYNamI3iIkKmWsOSbM",
  "authDomain": "studio-3849653404-e5627.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "978801814369"
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const firestore = getFirestore(app);

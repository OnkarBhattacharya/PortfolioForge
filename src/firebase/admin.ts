import { initializeApp, getApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

/**
 * A robust singleton for the Firebase Admin App.
 * This pattern ensures that initializeApp is called only once, even across
 * multiple serverless function invocations in the same container.
 *
 * @returns {App} The initialized Firebase Admin App instance.
 */
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables. This is required for server-side Firebase operations.');
  }

  return initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
  });
}

/**
 * A robust singleton for the Admin Firestore instance.
 *
 * @returns {Firestore} The initialized Admin Firestore instance.
 */
export function getAdminFirestore(): Firestore {
    const app = getAdminApp();
    return getFirestore(app);
}

/**
 * A robust singleton for the Admin Auth instance.
 *
 * @returns {Auth} The initialized Admin Auth instance.
 */
export function getAdminAuth(): Auth {
    const app = getAdminApp();
    return getAuth(app);
}

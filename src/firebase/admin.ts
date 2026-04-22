import { initializeApp, getApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // In production (App Hosting), use Application Default Credentials automatically.
  // In local dev, fall back to the service account key from .env.local.
  return initializeApp({
    credential: serviceAccountKey
      ? cert(JSON.parse(serviceAccountKey))
      : applicationDefault(),
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

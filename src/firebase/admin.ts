
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

let adminApp: App | undefined;

export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    // This is not a user-facing error, so we log it to the server console.
    // The API route will return a generic 500 error to the client.
    console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side operations will fail.');
    throw new Error('Internal server configuration error.');
  }

  if (getApps().length === 0) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error: any) {
      console.error("Failed to parse service account key or initialize Firebase Admin SDK:", error);
      throw new Error('Internal server configuration error.');
    }
  } else {
    adminApp = getApps()[0];
  }

  return adminApp!;
}

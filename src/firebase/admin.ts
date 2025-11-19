
import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// This function initializes the Firebase Admin SDK using a true singleton pattern.
export function getAdminApp(): App {
  // If the app is already initialized, return the existing instance.
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. It is required for server-side operations.');
  }

  try {
    // Initialize the app and return it.
    return initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
    });
  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw new Error(`Could not initialize Firebase Admin SDK. Please check the service account key. Original error: ${error.message}`);
  }
}

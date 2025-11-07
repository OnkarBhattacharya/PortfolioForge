
import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';

let adminApp: App;

// This function initializes the Firebase Admin SDK.
// It ensures that it's only initialized once (singleton pattern).
export function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }
    
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. It is required for server-side operations.');
    }
    
    try {
        adminApp = initializeApp({
            credential: cert(JSON.parse(serviceAccountKey)),
        });
        return adminApp;
    } catch (error: any) {
        console.error("Failed to initialize Firebase Admin SDK:", error);
        throw new Error(`Could not initialize Firebase Admin SDK. Please check the service account key. Original error: ${error.message}`);
    }
}

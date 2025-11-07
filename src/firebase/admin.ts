
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getRemoteConfig } from 'firebase-admin/remote-config';
import { credential } from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string;

function initializeAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    if (!serviceAccount) {
        throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
    }

    return initializeApp({
        credential: credential.cert(JSON.parse(serviceAccount)),
    });
}

export const adminApp = initializeAdminApp();
export const adminRemoteConfig = getRemoteConfig(adminApp);
